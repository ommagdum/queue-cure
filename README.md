# 🏥 Queue Cure

A modern, real-time queue management system for neighborhood clinics. Features a clean, clinical aesthetic with live WebSocket state synchronization. Built for the Hackathon.

## 🌟 Features

- **Real-Time Sync**: Instant WebSocket updates via STOMP/SockJS across all connected clients.
- **Receptionist Dashboard**: Check-in, call next, and complete consultations with live statistics.
- **Patient Display**: Full-screen, high-contrast monitor view for the waiting room ("Now Serving").
- **Concurrency Control**: Backend handles race conditions (e.g., two receptionists clicking "Call Next" simultaneously) via database locks (`SELECT FOR UPDATE`).
- **Wait Time Estimation**: Rolling average calculations cached in Redis for accurate patient wait estimates.
- **Clinical UI**: Built with Tailwind CSS, Lucide icons, and WCAG-compliant contrasts.

## 🛠 Tech Stack

- **Frontend**: React 18, Tailwind CSS v3, React Router v6, StompJS
- **Backend**: Spring Boot 3, Spring Data JPA, Spring WebSocket
- **Database**: PostgreSQL 16
- **Caching**: Redis 7

---

## 🚀 How to Run Locally

### 1. Start the Entire Stack
The project uses a complete Docker Compose setup that spins up the Frontend, Backend, PostgreSQL, and Redis in one command. Ensure Docker Desktop is running, then run:
```bash
docker-compose up --build -d
```
*(This will build the frontend and backend images from scratch on the first run. The `-d` flag runs them in the background.)*

### 2. Access the Application
Once the containers are up and running, open your browser:
- **Receptionist Dashboard**: [http://localhost:3000/receptionist](http://localhost:3000/receptionist)
- **Patient Display**: [http://localhost:3000/display](http://localhost:3000/display)

*(The backend API is exposed on `http://localhost:8080`, Postgres on `5433`, and Redis on `6379`)*

### 3. Stopping the Stack
To stop the application and database, run:
```bash
docker-compose down
```

---

## 🖥 Using the App

1. Open **[http://localhost:3000/receptionist](http://localhost:3000/receptionist)** in one window. This is the control center.
2. Open **[http://localhost:3000/display](http://localhost:3000/display)** in a second window and put it side-by-side. This simulates the waiting room TV.
3. Check in a patient from the receptionist dashboard and watch the display screen instantly update without refreshing!

## 📜 API Documentation

View the full REST and WebSocket documentation in [api_documentation.md](./api_documentation.md).
