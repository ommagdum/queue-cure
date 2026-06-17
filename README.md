<div align="center">

# 🏥 Queue Cure

**A real-time clinic queue management system — built for speed, clarity, and concurrency.**

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3-6DB33F?style=flat-square&logo=springboot)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis)](https://redis.io)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://docs.docker.com/compose/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%20v3-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)

</div>

---

## 🌐 Live Demo

> **Open these two URLs side by side in separate browser windows to see the real-time sync in action:**

| Screen | URL | Who uses it |
|---|---|---|
| 🖥 Receptionist Dashboard | [queue-cure.netlify.app/receptionist](https://queue-cure.netlify.app/receptionist) | The clinic receptionist |
| 📺 Patient Display Screen | [queue-cure.netlify.app/display](https://queue-cure.netlify.app/display) | The waiting room TV |

**Quick demo in 30 seconds:**
1. Open both links above in two separate windows and place them side by side
2. On the **receptionist** screen, type any name and click **Check In**
3. Watch the **display** screen update instantly — no refresh needed
4. Click **Call Next** → the patient appears as "Now Serving" on the display
5. Try the **⚡ Trigger Race** button (with 1 patient waiting) to see the DB lock in action

---

## 🔍 What is Queue Cure?

Queue Cure solves a problem every neighborhood clinic faces — chaotic, manual patient queues. Patients are handed token numbers at check-in. The receptionist manages the queue from a dashboard while a dedicated **waiting room TV screen** automatically displays who is currently being seen, who is next, and estimated wait times — all updating **live, in real time**, with no page refresh.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| **Live WebSocket Sync** | Every action (check-in, call next, done) broadcasts a full state snapshot via STOMP/SockJS to all connected clients instantly |
| **Receptionist Dashboard** | Check in patients, call the next token, mark consultations as Done or No Show, view live stats |
| **Patient Display Screen** | Full-screen waiting room monitor showing "Now Serving", "Up Next", and the waiting queue — designed to be readable from across a room |
| **Concurrency Control** | `SELECT FOR UPDATE` pessimistic lock prevents race conditions when two receptionists click "Call Next" simultaneously |
| **Smart Wait Estimates** | Rolling-average consultation durations cached in Redis drive per-patient wait time estimates, recomputed on every queue event |
| **Race Condition Demo** | Built-in dev panel fires two simultaneous API calls — judges watch one succeed and one get blocked by the DB lock in real time |
| **Responsive UI** | Fully responsive across desktop and mobile using Tailwind CSS breakpoints |
| **Clinical Design** | WCAG-compliant contrast, clean typography, Lucide icons — designed to feel like professional healthcare software |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React 18)                  │
│                                                             │
│  /receptionist               /display                       │
│  Receptionist Dashboard  ←→  Patient Display Screen         │
│                                                             │
│  useQueueState() hook                                        │
│  ├── REST  → mutations (check-in, call-next, done)          │
│  └── STOMP → subscribed to /topic/queue-updates             │
└──────────────┬──────────────────────┬───────────────────────┘
               │ HTTP REST            │ WebSocket (SockJS+STOMP)
               ▼                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Spring Boot 3)                   │
│                                                             │
│  QueueController  →  QueueService  →  QueueBroadcaster      │
│                             │                               │
│                    SELECT FOR UPDATE (Postgres)              │
│                    Rolling avg cache (Redis)                 │
│                    Full snapshot broadcast on every event   │
└──────────────┬──────────────────────────────────────────────┘
               │
     ┌─────────┴──────────┐
     ▼                    ▼
┌──────────┐        ┌──────────┐
│ Postgres │        │  Redis   │
│    16    │        │    7     │
│ (queue,  │        │ (rolling │
│  locks)  │        │  avg)    │
└──────────┘        └──────────┘
```

### WebSocket Flow
1. Client connects to `/ws` via **SockJS** (transport) + **STOMP** (messaging protocol)
2. Client subscribes to `/topic/queue-updates` — **read-only**
3. Receptionist performs an action via **REST POST** (never via STOMP)
4. Spring service writes to DB, updates Redis, calls `SimpMessagingTemplate.convertAndSend()`
5. Spring's in-memory STOMP broker **fans out** a full `QueueStateDTO` snapshot to **all subscribers simultaneously**
6. Both the receptionist tab and display screen update in < 100ms

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router v6, Tailwind CSS v3, StompJS, SockJS |
| Backend | Spring Boot 3, Spring Data JPA, Spring WebSocket (STOMP) |
| Database | PostgreSQL 16 (pessimistic locking via `SELECT FOR UPDATE`) |
| Caching | Redis 7 (rolling average consultation durations) |
| Icons | Lucide React |
| DevOps | Docker, Docker Compose (multi-stage builds) |

---

## 🚀 Running Locally

### One-command startup (Docker)

Ensure Docker Desktop is running, then:

```bash
docker-compose up --build -d
```

This spins up all four services — PostgreSQL, Redis, the Spring Boot backend, and the React frontend served by Nginx.

| Service | URL |
|---|---|
| Receptionist Dashboard | http://localhost:3000/receptionist |
| Patient Display Screen | http://localhost:3000/display |
| Backend API | http://localhost:8080/api/v1/queue |
| PostgreSQL | localhost:5433 |
| Redis | localhost:6379 |

To stop everything:
```bash
docker-compose down
```

### Manual startup (for development)

**Step 1 — Databases:**
```bash
docker-compose up postgres redis -d
```

**Step 2 — Backend:**
```bash
cd backend
./mvnw spring-boot:run
```

**Step 3 — Frontend:**
```bash
cd frontend
npm install
npm start
```

---

## 🎬 Demo Walkthrough

### Side-by-side setup

Open two browser windows and snap them to opposite halves of your screen:
- **Left window** → [queue-cure.netlify.app/receptionist](https://queue-cure.netlify.app/receptionist)
- **Right window** → [queue-cure.netlify.app/display](https://queue-cure.netlify.app/display)

Both screens will show a 🟢 **Live** badge in the top-right corner when the WebSocket connection is established.

### Walkthrough steps
1. Type a patient name on the receptionist screen → click **Check In** → watch the name appear on the display screen in under a second
2. Add 2–3 more patients — watch the waiting queue and estimated times update on the display
3. Click **Call Next** → the patient jumps to the large "Now Serving" slot on the display
4. Click **Done** → the next patient automatically becomes "Now Serving"
5. Mark a patient as **No Show** → watch the queue shift and wait times recalculate instantly
6. **Race Condition Demo:** Ensure exactly **1 patient is WAITING**, then click **⚡ Trigger Race** — one request gets ✅ Succeeded, the other gets ❌ Blocked by DB Lock

---

## 📂 Project Structure

```
queue-cure/
├── backend/                  # Spring Boot application
│   ├── src/main/java/com/queuecure/
│   │   ├── controller/       # REST endpoints
│   │   ├── service/          # Business logic, wait-time calculation
│   │   ├── dto/              # QueueStateDTO, QueueEntryDTO, QueueStatsDTO
│   │   ├── model/            # JPA entities
│   │   ├── repository/       # Spring Data JPA + custom queries
│   │   └── websocket/        # STOMP config, QueueBroadcaster
│   └── Dockerfile
├── frontend/                 # React application
│   ├── src/
│   │   ├── api/              # queueApi.js (REST wrappers)
│   │   ├── hooks/            # useQueueState, useWebSocket
│   │   ├── components/       # StatusBadge, PatientRow, StatsBar, etc.
│   │   └── pages/            # ReceptionistPage, DisplayPage
│   └── Dockerfile
├── docker-compose.yml        # Full stack orchestration
└── README.md
```

---

## 📜 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/queue/` | Get full queue snapshot |
| `POST` | `/api/v1/queue/checkin` | Check in a new patient `{ patientName }` |
| `POST` | `/api/v1/queue/call-next` | Call the next WAITING patient (uses DB lock) |
| `POST` | `/api/v1/queue/{id}/done` | Mark a consultation as complete |
| `POST` | `/api/v1/queue/{id}/no-show` | Mark a patient as no-show |
| `GET` | `/api/v1/queue/stats` | Get live statistics |
| `WS` | `/ws` → `/topic/queue-updates` | STOMP subscription for real-time broadcasts |

Full API documentation → [api_documentation.md](./api_documentation.md)
