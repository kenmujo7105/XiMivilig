# Tournament Management System

A robust REST API for managing sports and esports tournaments, inspired by the core bracket engine of Challonge. Built with **Spring Boot 3** and **Java 21**.

## 🚀 Key Features

*   **Bracket Engine:**
    *   **Single Elimination:** Auto-calculates bracket size (power of 2), handles BYEs, and auto-advances winners.
    *   **Round Robin:** Circle method implementation for generating round-by-round matchups.
*   **Live Updates:** WebSocket (`/ws`) integration to push live match scores to the frontend.
*   **Email Notifications:** Asynchronous email alerts for team registration approvals and rejections.
*   **Authentication & Authorization:** JWT-based stateless authentication with Role-Based Access Control (`ADMIN`, `ORGANIZER`, `PLAYER`).
*   **Team & Roster Management:** Captains can create teams, manage rosters, and register for open tournaments.

## 🛠️ Tech Stack

*   **Framework:** Spring Boot 3.2.x (Java 21)
*   **Database:** PostgreSQL 16
*   **ORM:** Spring Data JPA / Hibernate
*   **Security:** Spring Security + jjwt (0.12.x)
*   **Messaging:** Spring WebSocket (STOMP)
*   **Mail:** Spring Boot Starter Mail + JavaMailSender
*   **Documentation:** Springdoc OpenAPI (Swagger UI)
*   **Infrastructure:** Docker & Docker Compose

## 📦 Local Development

### 1. Prerequisites
*   Docker & Docker Compose
*   Java 21
*   Maven 3.9+

### 2. Environment Configuration
Copy the `.env.example` file to `.env` and configure your local settings:

```bash
cp .env.example .env
```
*Note: To test email features, you must provide valid SMTP credentials (e.g., Gmail App Password) in the `.env` file.*

### 3. Start Infrastructure
Start the PostgreSQL database using Docker Compose:

```bash
docker-compose up -d
```

### 4. Run the Application
You can run the application using Maven:

```bash
./mvnw spring-boot:run
```

The API will be available at `http://localhost:8080`.

## 📚 API Documentation

Once the application is running, you can access the interactive Swagger UI documentation at:

```
http://localhost:8080/swagger-ui.html
```

Use the `/api/auth/register` and `/api/auth/login` endpoints to get a Bearer Token, then click **Authorize** in Swagger UI to test secured endpoints.

## 🐳 Running with Docker

You can package and run the entire application (DB + API) via Docker:

```bash
# Build the application image
docker build -t tournament-api .

# (Optional) Update docker-compose.yml to include the API service
```

## 📜 License
This project is licensed under the MIT License.
