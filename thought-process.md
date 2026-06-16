# Thought Process — Queue Cure '26

## 1. Problem understanding

Walk into most neighborhood clinics in India and you'll see the same thing: a paper token dispenser, a whiteboard with a number scrawled in marker, and a waiting room full of people who have no idea if they're 5 minutes or 45 minutes from being seen. The receptionist calls a number out loud, someone misses it because they stepped out for water, and the whiteboard only changes when someone remembers to walk over and update it.

The real problem is that the receptionist knows the queue state and nobody else does. On top of that, there's no record of how long consultations actually take, so any wait estimate is just a guess.

Queue Cure fixes this by treating the queue as a shared, live data structure. Check-in, call next, mark done — every action the receptionist takes shows up on the waiting room screen immediately. No refresh, no polling, nothing for the patient to do.

## 2. Architecture and stack

- Backend: Spring Boot 3 (Java 21), Spring Data JPA, Spring WebSocket
- Database: PostgreSQL 16
- Cache: Redis 7
- Frontend: React 18, React Router v6, Tailwind CSS v3
- Real-time transport: SockJS + STOMP over Spring's in-memory broker

**Why Spring Boot instead of Express or FastAPI?** The thing that actually mattered here was the concurrency requirement — two receptionists must never be able to call the same patient. That needs a `SELECT FOR UPDATE` lock at the transaction level, and Spring's `@Transactional` makes that almost boring to implement correctly. Doing the same thing in Node would mean hand-rolling `BEGIN / SELECT FOR UPDATE / COMMIT` with something like `pg`, which is doable but easy to get subtly wrong.

**Why Postgres instead of MongoDB?** The queue is relational by nature — sequential token numbers, a defined status state machine, consultation logs tied to specific entries. A document store doesn't buy anything here, and its transaction model would have made the locking story more annoying, not less. Postgres row locks are a first-class feature and slot right into JPA.

**Why WebSockets over polling?** Polling means baked-in lag equal to whatever interval you pick, plus wasted requests from a screen that might sit open for hours. A persistent socket is cheaper to run and, more importantly, it actually feels live. With STOMP push, the display updates in under 100ms after any receptionist action — that instant feel is basically the whole pitch.

**Why STOMP and not a raw socket?** A raw WebSocket is just bytes with no structure. STOMP gives you named destinations (`/topic/queue-updates`), so the server broadcasts to a channel instead of tracking a list of open connections by hand. It also makes future changes — per-clinic topics, say — a lot less painful.

**Why Redis for the wait-time average?** The rolling average consultation time needs to survive between requests, but it's a statistical estimate, not something that needs ACID guarantees. Updating it in Redis is far faster than aggregating the `consultation_logs` table on every queue read, and it survives app restarts.

## 3. Data model

**`queue_entries`**

| Field | Type | Purpose |
|---|---|---|
| `id` | UUID | Primary key — avoids sequential ID guessing |
| `patient_name` | String | Display name |
| `token_number` | Integer | Sequential, used for ordering |
| `status` | Enum | `WAITING → IN_PROGRESS → DONE / NO_SHOW` |
| `check_in_time` | Timestamp | Arrival time, for display and audit |
| `start_time` | Timestamp | Consultation start |
| `end_time` | Timestamp | Consultation end, paired with `start_time` to get duration |

**`consultation_logs`**

| Field | Type | Purpose |
|---|---|---|
| `id` | UUID | Primary key |
| `duration_seconds` | Integer | Measured consultation length |
| `recorded_at` | Timestamp | When the log was written |

These are kept in separate tables on purpose. Consultation logs are a time series feeding into a statistical average; queue entries are an operational record. Mixing the two would tie the wait-time math to the queue schema, which makes both harder to change later.

A couple of smaller decisions worth flagging: UUIDs instead of auto-increment integers, so a client who knows patient 42 can't just try patient 43. And an enum for status instead of a boolean flag, because there are genuinely four states here, not two — a boolean can't represent `NO_SHOW` vs `DONE` vs `WAITING` vs `IN_PROGRESS`, and the enum keeps queries like `WHERE status = 'WAITING'` explicit.

## 4. Real-time sync

The approach is full state snapshots over STOMP, not granular delta events like `PATIENT_CALLED` or `PATIENT_DONE`. Every mutation broadcasts the entire `QueueStateDTO` — full list of entries, current statuses, recomputed wait times.

This was a tradeoff I made deliberately. Deltas use less bandwidth, but they push reconciliation logic onto the client: apply events in order, handle gaps from a dropped connection, make sure local state doesn't drift from the server's. With full snapshots, the client just replaces its state wholesale on every message. There's nothing to reconcile and nothing to get out of sync.

The flow:

1. Receptionist clicks Call Next → `POST /api/v1/queue/call-next`
2. The controller enters a `@Transactional` method
3. JPA runs `SELECT * FROM queue_entries WHERE status = 'WAITING' ORDER BY token_number ASC LIMIT 1 FOR UPDATE`
4. The row locks, status flips to `IN_PROGRESS`, transaction commits
5. `QueueBroadcaster` calls `SimpMessagingTemplate.convertAndSend("/topic/queue-updates", snapshot)`
6. The STOMP broker pushes that snapshot to every subscriber at once
7. Both the receptionist tab and the display screen swap in the new state

On the client side, a `useWebSocket` hook connects through SockJS to `/ws`, upgrades to STOMP, and subscribes to `/topic/queue-updates` right away. Every incoming message triggers a state update, which re-renders both pages. All mutations go through REST — the socket channel only ever goes server to client.

## 5. Wait time math

```
estimated_wait_minutes(position) = ceil(avg_consult_minutes × effective_position)

where:
  avg_consult_minutes = rolling_average(last N consultation durations, in Redis)
  effective_position  = position - adjustment_factor(no_shows, total_processed)
```

`computeWaitMinutes` takes three inputs: the patient's position in the waiting subqueue, how many patients have been fully processed today (a rough signal for how trustworthy the average is yet), and how many no-shows there have been (which shrinks the effective queue, since those patients aren't actually slowing anything down).

The rolling average updates in Redis every time a consultation is marked done, using the real `start_time` to `end_time` gap. So the estimate gets sharper over the course of the day as actual data piles up.

I didn't want to hardcode something like "10 minutes per patient" because that number means nothing across clinics — a GP doing quick follow-ups might run 3-minute visits, a specialist doing detailed work might run 15. A fixed number would be wrong almost everywhere it's deployed. The rolling average just adapts to whatever pace that specific clinic is actually running at.

One small choice: `ceil()` instead of `round()` or `floor()`. I'd rather the system slightly overestimate and have someone arrive a bit early than underestimate and have them step out at exactly the wrong moment.

## 6. Concurrency

The scenario that actually worried me: two receptionists, two different tabs, both click Call Next within milliseconds of each other. Without protection, both reads could land on the same WAITING patient, and that patient gets called twice — which is exactly the kind of bug that looks fine in testing and then breaks in front of a clinic owner.

The fix is a pessimistic lock:

```sql
SELECT * FROM queue_entries
WHERE status = 'WAITING'
ORDER BY token_number ASC
LIMIT 1
FOR UPDATE
```

`FOR UPDATE` takes a row-level exclusive lock the moment the row is read, inside an open transaction. The second request blocks on that same statement until the first transaction commits. By the time it unblocks, the first patient is already `IN_PROGRESS`, so the second request just moves to the next WAITING patient, or returns 204 if there isn't one.

That's correct behavior, not a bug to paper over — if two patients are waiting, two simultaneous clicks should call both of them. If only one is waiting, one click should succeed and the other should naturally fall through to "no one left."

There's a small demo panel in the UI that fires two simultaneous `fetch('/api/v1/queue/call-next')` calls through `Promise.all` and shows the result — one green success, one red "blocked by DB lock." It's there so a judge can see the protection working without me having to explain SQL locking out loud.

Check-in uses the same pattern: token numbers come from `SELECT MAX(token_number) + 1` inside the same transactional boundary, so simultaneous check-ins serialize at the database level instead of colliding.

## 7. Edge cases

**No-shows.** Marking someone NO_SHOW dims them in the queue list and, more importantly, feeds into the wait-time formula — it shrinks the effective queue length so the estimate doesn't stay inflated by patients who already left.

**Walk-ins mid-consultation.** A patient checking in while someone else is being seen gets the next sequential token and an estimate based on the current rolling average, and shows up on the display in the same broadcast.

**Empty queue.** The backend returns a 204 with no body. The frontend checks for that status before trying to parse JSON — skip that check and you get a parse error in the console mid-demo, which is exactly the kind of thing that's embarrassing to debug live. The UI just shows a toast: "No patients waiting."

**Receptionist mistakes.** There's no real undo. I considered building one, but a proper undo stack means event sourcing or a command log, and that felt like scope creep for what this needs to prove. Instead, the receptionist can mark a wrongly-called patient as NO_SHOW and re-add them. It's not elegant, but it covers the actual common case.

**Disconnection and reconnection.** The `useWebSocket` hook retries every 5 seconds. On reconnect, it immediately calls `GET /api/v1/queue/` for a fresh snapshot rather than trying to replay missed STOMP messages. A client that was offline for any stretch is fully caught up after one round trip, no message-ordering assumptions required.

**Server restart.** Queue state lives in Postgres, so a restart doesn't lose it. Redis only holds the rolling average — if that resets, the system just rebuilds it from new consultations as the day goes on. Nothing about the queue itself is at risk.

**Two Done clicks on the same patient.** First request wins and flips status to DONE. The second finds the entry already DONE and gets an error back, which the frontend catches with a conflict toast and a re-fetch. The UI corrects itself rather than showing stale state.

## 8. Tradeoffs

| Decision | Simplified | What production needs |
|---|---|---|
| Single clinic | No multi-tenancy or clinic scoping | Per-clinic isolation, namespaced topics, auth |
| In-memory STOMP broker | Spring's simple broker | A real message bus (RabbitMQ, ActiveMQ) for scale |
| Rolling average | Plain running average | A windowed median, less sensitive to outliers |
| No auth | Anyone with the URL gets receptionist access | Role-based auth: receptionist, admin, display |
| No audit trail | Status changes aren't attributed | Action log for accountability |
| Token numbering | Grows unbounded per session | Daily reset and archival |
| Single in-progress slot | One patient at a time, system-wide | Per-doctor queue lanes for multi-doctor clinics |

I cut these corners on purpose — they're real gaps, not oversights, and each one is a reasonable next step rather than a surprise.

## 9. The moment that sells it

A clinic owner watching both screens side by side sees a patient's name show up on the waiting room display before the receptionist has even looked up from typing it. That's the moment paper tokens stop making sense.