# Queue Cure '26 — Backend API Documentation

**Version:** 1.0  
**Base URL:** `http://localhost:8080`  
**Author:** Om Magdum  
**Stack:** Spring Boot 3 · PostgreSQL · Redis · STOMP/WebSocket

---

## Overview

Queue Cure is a **live digital queue management system** for neighbourhood clinics. The backend exposes a REST API for all queue operations and a WebSocket channel that pushes real-time updates to every connected screen instantly — no page refresh needed.

**Two types of consumers:**
| Consumer | How they use the backend |
|---|---|
| **Receptionist Dashboard** | Calls REST endpoints (check-in, call next, done, no-show) |
| **Patient Display Screen** | Subscribes to WebSocket only — receives live updates passively |

---

## Tech Stack Snapshot

| Layer | Technology |
|---|---|
| Framework | Spring Boot 3.3 (Java 22) |
| Database | PostgreSQL 16 — stores all queue entries |
| Cache | Redis 7 — stores rolling average of last 5 consult durations |
| Real-time | STOMP over SockJS WebSocket |
| ORM | Hibernate 6 / Spring Data JPA |

---

## Data Models

### QueueEntry (Database Table: `queue_entries`)

Every patient in the system is a `QueueEntry`.

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Auto-generated unique identifier |
| `patientName` | String | Patient's name (required at check-in) |
| `tokenNumber` | Integer | Auto-incremented per session (1, 2, 3...) |
| `status` | Enum | See Status Values below |
| `checkInTime` | DateTime | Set when patient is checked in |
| `startTime` | DateTime | Set when patient is called (IN_PROGRESS) |
| `endTime` | DateTime | Set when DONE or NO_SHOW |
| `version` | Long | Internal — used for optimistic locking, never send this to backend |

**Status Values:**

| Status | Meaning |
|---|---|
| `WAITING` | Patient checked in, waiting to be called |
| `IN_PROGRESS` | Patient currently with the doctor |
| `DONE` | Consultation completed |
| `NO_SHOW` | Patient was called but did not show up |

---

### ConsultationLog (Database Table: `consultation_log`)

Auto-created on every `DONE` action. Used to compute wait-time averages.

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Auto-generated |
| `durationSeconds` | Integer | How long the consultation lasted |
| `recordedAt` | DateTime | When this log was created |

> **Frontend devs:** You never need to call this directly. It feeds the `avgConsultMinutes` value in every snapshot automatically.

---

## Response Shape

Every REST endpoint and every WebSocket message returns a **`QueueStateDTO`** — a full snapshot of the entire queue at that moment.

```json
{
  "entries": [
    {
      "id": "adf7c860-0953-4bd9-83a8-c8deaabbc8e4",
      "patientName": "Ramesh Kumar",
      "tokenNumber": 1,
      "status": "WAITING",
      "checkInTime": "2026-06-16T12:11:49",
      "startTime": null,
      "endTime": null,
      "estimatedWaitMinutes": 10
    }
  ],
  "stats": {
    "totalWaiting": 1,
    "currentlyInProgress": 0,
    "avgConsultMinutes": 10.0,
    "estimatedNextWaitMinutes": 10.0
  },
  "connectionStatus": "LIVE"
}
```

**Key design decision:** The backend always sends the **full snapshot**, never a delta/patch. The frontend simply replaces its entire local state on every update. This eliminates any risk of stale or corrupted UI state.

---

## REST API Endpoints

All endpoints are prefixed with `/api/v1/queue`.

---

### GET `/api/v1/queue/`

**Purpose:** Fetch the current full queue state.  
**When to call:** On page load, and again after a WebSocket reconnection.  
**Auth:** None  
**Body:** None

**Response:** `200 OK` with `QueueStateDTO`

```json
{
  "entries": [],
  "stats": {
    "totalWaiting": 0,
    "currentlyInProgress": 0,
    "avgConsultMinutes": 10.0,
    "estimatedNextWaitMinutes": 10.0
  },
  "connectionStatus": "LIVE"
}
```

---

### POST `/api/v1/queue/checkin`

**Purpose:** Register a new patient and assign the next token number.  
**When to call:** When receptionist clicks "Check In".  
**Auth:** None  
**Content-Type:** `application/json`

**Request Body:**
```json
{
  "patientName": "Ramesh Kumar"
}
```

**Response:** `200 OK` with updated `QueueStateDTO` (patient appears in entries list with `status: WAITING`)

> **Side effect:** Triggers a WebSocket broadcast to all connected screens immediately.

---

### POST `/api/v1/queue/call-next`

**Purpose:** Call the next WAITING patient. Sets their status to `IN_PROGRESS`.  
**When to call:** When receptionist clicks "Call Next".  
**Auth:** None  
**Body:** None

**Response (patient available):** `200 OK` with updated `QueueStateDTO`

**Response (no one waiting):** `204 No Content`
```
(empty body)
```

> **Frontend note:** Handle `204` by showing a "No patients waiting" message. Do not treat it as an error.

> **Concurrency note:** This endpoint uses a database-level lock (`SELECT FOR UPDATE`). If two receptionists click simultaneously, only one succeeds. The second either gets `204` or waits for the lock to release.

> **Side effect:** Triggers a WebSocket broadcast to all connected screens immediately.

---

### POST `/api/v1/queue/{id}/done`

**Purpose:** Mark an `IN_PROGRESS` patient as `DONE`. Records consultation duration.  
**When to call:** When receptionist clicks "Done" on an active patient.  
**Auth:** None  
**Body:** None  
**Path param:** `id` — the UUID of the patient entry

**Response:** `200 OK` with updated `QueueStateDTO`

> **Side effect 1:** Saves consultation duration to `consultation_log` table.  
> **Side effect 2:** Pushes duration to Redis rolling average list (last 5 entries).  
> **Side effect 3:** Triggers a WebSocket broadcast.

---

### POST `/api/v1/queue/{id}/no-show`

**Purpose:** Mark a `WAITING` or `IN_PROGRESS` patient as `NO_SHOW`.  
**When to call:** When receptionist clicks "No Show".  
**Auth:** None  
**Body:** None  
**Path param:** `id` — the UUID of the patient entry

**Response:** `200 OK` with updated `QueueStateDTO`

> **Side effect:** Triggers a WebSocket broadcast. No-show rate is recalculated and affects wait-time estimates for remaining patients.

---

### GET `/api/v1/queue/stats`

**Purpose:** Returns just the stats portion of the snapshot (convenience endpoint).  
**Auth:** None  
**Body:** None

**Response:** `200 OK`
```json
{
  "totalWaiting": 3,
  "currentlyInProgress": 1,
  "avgConsultMinutes": 8.5,
  "estimatedNextWaitMinutes": 8.5
}
```

---

## WebSocket (Real-Time Updates)

### Connection Details

| Property | Value |
|---|---|
| Endpoint | `http://localhost:8080/ws` |
| Protocol | STOMP over SockJS |
| Subscribe topic | `/topic/queue-updates` |

### How to Connect (JavaScript)

```javascript
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const client = new Client({
  webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
  onConnect: () => {
    client.subscribe('/topic/queue-updates', (message) => {
      const queueState = JSON.parse(message.body);
      // Replace your entire local state with queueState
    });
  }
});

client.activate();
```

### What You Receive

Every mutation (check-in, call-next, done, no-show) triggers an automatic broadcast. You receive a full `QueueStateDTO` — identical in shape to the REST GET response.

### Reconnection Strategy

Implement exponential backoff: retry at 1s → 2s → 4s → 8s → max 30s.  
On successful reconnect, call `GET /api/v1/queue/` to re-fetch state before re-subscribing.

---

## Wait-Time Algorithm

### Formula
```
estimatedWait(position N) = N × rollingAverageConsultDuration
```

- **Rolling average** = mean of last 5 completed consultation durations (stored in Redis)
- **Fallback** = 10 minutes (if fewer than 1 consultation completed this session)
- **Position N** = the patient's position in the WAITING queue (1 = next to be called)

### No-Show Discount

If no-show rate ≥ 20%:
```
adjustedWait = estimatedWait × (1 - noShowRate)
```

This makes estimates more accurate in high-no-show sessions.

### Example

5 consultations completed, averaging 8 minutes. 1 no-show out of 5 processed (20% rate).

| Patient | Raw Position | Raw Wait | After Discount |
|---|---|---|---|
| Token 3 | 1 | 8 min | 6.4 min |
| Token 5 | 2 | 16 min | 12.8 min |
| Token 7 | 3 | 24 min | 19.2 min |

---

## Error Handling

### Error Response Shape

```json
{
  "error": "Human readable message",
  "status": 409,
  "timestamp": "2026-06-16T12:11:49"
}
```

### Error Codes

| HTTP Code | When it happens | Recommended Frontend Action |
|---|---|---|
| `204 No Content` | `call-next` with no WAITING patients | Show "No patients waiting" toast |
| `404 Not Found` | Patient UUID doesn't exist (stale frontend) | Refresh queue via `GET /api/v1/queue/` |
| `409 Conflict` | Two users mutated the same record simultaneously | Show "Action conflict — queue refreshed" toast, then `GET /api/v1/queue/` |

---

## Concurrency Guarantees

| Scenario | How it's handled |
|---|---|
| Two receptionists click "Call Next" at the same time | Database `SELECT FOR UPDATE` lock — only one succeeds, the other gets `204` |
| Two receptionists edit the same patient simultaneously | `@Version` optimistic lock — second request gets `409 Conflict` |
| Server restart mid-session | Client reconnects via backoff, re-fetches full state on reconnect |
| Stale frontend tries to mark already-DONE patient | `409 Conflict` returned, frontend refreshes |

---

## Configuration Reference

Key values in `application.yml` that affect behaviour:

| Key | Default | Effect |
|---|---|---|
| `clinic.default_consult_minutes` | `10` | Fallback wait time when no consultations done yet |
| `server.port` | `8080` | Port the API runs on |
| `spring.datasource.url` | `jdbc:postgresql://localhost:5433/queuecure` | PostgreSQL connection |
| `spring.data.redis.port` | `6379` | Redis connection |

---

## Quick Reference Card

| Action | Method | URL | Body |
|---|---|---|---|
| Get full queue | GET | `/api/v1/queue/` | — |
| Check in patient | POST | `/api/v1/queue/checkin` | `{"patientName": "..."}` |
| Call next patient | POST | `/api/v1/queue/call-next` | — |
| Mark done | POST | `/api/v1/queue/{id}/done` | — |
| Mark no-show | POST | `/api/v1/queue/{id}/no-show` | — |
| Get stats only | GET | `/api/v1/queue/stats` | — |
| WebSocket topic | SUB | `/topic/queue-updates` | — |
