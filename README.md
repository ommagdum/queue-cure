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

### 1. Start the Databases
The project uses Docker to run PostgreSQL and Redis. Ensure Docker Desktop is running, then start the containers:
```bash
docker-compose up -d
```
*(Postgres runs on port `5433`, Redis on port `6379`)*

### 2. Start the Backend (Spring Boot)
Open the `backend` folder in your IDE (IntelliJ IDEA recommended) or use Maven directly:
```bash
cd backend
./mvnw spring-boot:run
```
*(The backend runs on `http://localhost:8080`)*

### 3. Start the Frontend (React)
Open a new terminal window, navigate to the frontend folder, and start the development server:
```bash
cd frontend
npm install
npm start
```
*(The frontend runs on `http://localhost:3000`)*

---

## 🖥 Using the App

1. Open **[http://localhost:3000/receptionist](http://localhost:3000/receptionist)** in one window. This is the control center.
2. Open **[http://localhost:3000/display](http://localhost:3000/display)** in a second window and put it side-by-side. This simulates the waiting room TV.
3. Check in a patient from the receptionist dashboard and watch the display screen instantly update without refreshing!

## 📜 API Documentation

View the full REST and WebSocket documentation in [api_documentation.md](./api_documentation.md).
