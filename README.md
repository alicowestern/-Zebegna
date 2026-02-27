# Zebegna (ዘበኛ)

Zebegna is a full-stack gate operations system for registering devices and approving exits in a controlled, auditable workflow.

The goal is practical: give gate officers a fast tool at the checkpoint while giving admins clear control over user accounts and activity history.

## What This Project Does

- Registers devices with owner details (employee or guest).
- Supports serial-based search and autocomplete for quick gate checks.
- Approves exits or performs manual verification when needed.
- Uses soft delete to keep records recoverable.
- Logs key actions for traceability.
- Automatically resets verified devices back to `PENDING` after 10 minutes so repeat exits can be processed safely.

## Architecture

### Frontend
- Next.js (App Router), React, Axios, date-fns
- Client-side auth state via localStorage (`zb_token`, `zb_user`)
- Role-aware UI:
  - `ADMIN`: user management dashboard
  - `GATE_OFFICER`: device registration and verification actions

### Backend
- Spring Boot 3.2.3, Java 17
- Spring Security + JWT (stateless auth)
- Spring Data JPA + PostgreSQL
- Flyway migration for schema creation
- Scheduled task for verification status reset

### Database
Main tables:
- `users`
- `persons`
- `devices`
- `activity_log`

Migration:
- `backend/src/main/resources/db/migration/V1__init_schema.sql`

## Role Access Model

- Public:
  - `POST /api/auth/login`
- Authenticated users:
  - Device listing/search/suggestions (`GET /api/devices/**`)
- `GATE_OFFICER`:
  - Register/update devices
  - Approve exit / manual verification
- `ADMIN`:
  - Manage gate officer accounts
  - View activity logs

## API Summary

### Authentication
- `POST /api/auth/login`

### Devices
- `GET /api/devices?search=...`
- `GET /api/devices/suggestions?prefix=...`
- `POST /api/devices`
- `PUT /api/devices/{id}`
- `DELETE /api/devices/{id}` (soft delete)
- `POST /api/devices/{id}/verify`
- `POST /api/devices/{id}/manual-verification`

### Admin
- `GET /api/users`
- `POST /api/users`
- `PUT /api/users/{id}/reset-password`
- `PUT /api/users/{id}/toggle-active`
- `GET /api/activity-logs?limit=100`

## Project Structure

```text
backend/
  src/main/java/com/zebegna/backend/
    config/
    controller/
    dto/
    entity/
    exception/
    repository/
    service/
  src/main/resources/
    application.properties
    db/migration/V1__init_schema.sql
  pom.xml
  mvnw.cmd
  .mvn/wrapper/

frontend/
  src/app/
    login/
    devices/
    admin/
  src/components/
  src/hooks/
  src/services/
  src/styles/
```

## Prerequisites

- Java 17+
- PostgreSQL 14+ (or compatible)
- Node.js 18+ and npm

## Local Setup

### 1. Create Database

```sql
CREATE DATABASE zebegna;
```

### 2. Configure Backend

Update:
- `backend/src/main/resources/application.properties`

Important values:
- `spring.datasource.url`
- `spring.datasource.username`
- `spring.datasource.password`
- `app.jwt.secret` (change this for any non-local environment)
- `app.cors.allowed-origins`

### 3. Run Backend

From `backend`:

```bash
mvnw.cmd spring-boot:run
```

Backend runs on:
- `http://localhost:8080`

Flyway applies migration automatically on startup.

### 4. Run Frontend

From `frontend`:

```bash
npm install
npm run dev
```

Frontend runs on:
- `http://localhost:3000`

## Default Seed Users (Development Only)

At startup, the app ensures these accounts exist and resets their passwords:

- `admin` / `admin123` (`ADMIN`)
- `officer1` / `officer123` (`GATE_OFFICER`)

Use these only for local development. Change credentials immediately in any shared or production-like environment.

## Operational Notes

- Device list behavior:
  - `PENDING` devices are always shown.
  - `APPROVED` / `MANUAL` devices remain visible for 10 minutes, then a scheduler resets them to `PENDING`.
- This design supports repeated exits for the same device across the day without losing history.

## Security Notes

- API uses Bearer JWT in `Authorization` header.
- Passwords are stored with BCrypt hashing.
- CORS is restricted by `app.cors.allowed-origins`.
- Do not keep default JWT secret or default user passwords outside local development.

## Troubleshooting

- If frontend API calls fail with 404/connection errors:
  - Ensure backend is running on `http://localhost:8080`.
  - Ensure your Next.js rewrite for `/api/*` points to backend.
- If login fails unexpectedly:
  - Check database connectivity and migration state.
  - Verify seed users exist in `users`.
- If browser access is blocked by CORS:
  - Update `app.cors.allowed-origins` with your frontend origin.

## License

No license file is currently included in this repository. Add one before public distribution.
