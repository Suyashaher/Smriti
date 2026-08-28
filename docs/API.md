# API contract (planned)

Phase 1 documents the FastAPI surface. **No routes are implemented yet** (Phase 9+). All mutating requests are validated with Pydantic. Protected routes require JWT (Phase 11). The browser never calls MongoDB.

Base URL (local): `http://localhost:8000` (exact host/port from `.env` / CORS).

## Route groups

| Prefix | Purpose |
|--------|---------|
| `/auth` | Register, login, logout, refresh tokens |
| `/users` | User profile (role-scoped) |
| `/patients` | Patient records |
| `/caregivers` | Caregiver records and `patient_caregiver` links |
| `/games` | Game catalog / session metadata if needed |
| `/game-results` | Ingest and query `GameResult` (idempotent on client UUID) |
| `/reminders` | Reminder definitions and events |
| `/routines` | Daily routines |
| `/analytics` | Non-diagnostic performance aggregates |
| `/alerts` | Caregiver alerts |
| `/sync` | Batch ingest from IndexedDB queue |
| `/devices` | Device UUID registration and last-seen |

Health check (to add with the app): `GET /health`.

## Auth (Phase 11)

- Access JWT + refresh token
- Roles: `PATIENT`, `CAREGIVER`, `HEALTHCARE_WORKER`, `ADMIN`
- Caregiver and healthcare routes must not leak other patients’ data

## Sync (Phase 12)

`POST /sync` accepts a batch of queue items (`id`, `type`, `patientId`, `timestamp`, `payload`, `deviceId`). Server:

- Upserts by client `id` (idempotent)
- Returns per-item status (`SYNCED` | `FAILED` with error code)
- Never requires the client to block UI on this call

## Errors

Use consistent JSON: `detail`, optional `code`. HTTP 401/403 for authz. Validation errors from Pydantic (422).

## OpenAPI

When FastAPI exists, `/docs` (Swagger) is the live contract. This file remains the product-level grouping until then.
