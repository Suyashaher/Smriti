# Phase 8 Audit & Architecture Plan

## Executive Summary
Prior to Phase 8, the Smriti backend was a complete placeholder. The `backend/app/` directory contained only empty subdirectories with `.gitkeep` files. There was no Python code, no API routes, and no database connection. The frontend had partial sync types and a Dexie queue table, but no API client or sync engine.

This document serves as the historical record of the Phase 8 architecture that bridged the offline-first React frontend with a local FastAPI/MongoDB backend.

## 1. Backend Architecture (FastAPI + MongoDB)
**Stack:** FastAPI, Uvicorn, Pydantic v2, PyMongo, python-dotenv.

### Why PyMongo over Motor?
For a completely local deployment (MongoDB on localhost via Docker, FastAPI on localhost), network latency is zero. The FastAPI threadpool easily handles the synchronous I/O of PyMongo for the expected single-user or small-facility scale. Motor (async MongoDB) would add `await` noise and complexity without a tangible performance benefit in this environment.

### API Router Groups
- `/health` - Liveness and database connection probe
- `/patients` - Patient profile CRUD
- `/games` - Game result ingestion and history
- `/reminders` - Reminder and reminder event CRUD
- `/routines` - Daily routine definitions
- `/settings` - Patient preferences
- `/sync` - **The primary ingestion endpoint** for batch synchronization

### Idempotency
Every mutating record (GameResult, Reminder, Routine, SyncEvent) has a client-generated UUID.
The MongoDB collections enforce `unique` indexes on these `id` fields.
If the frontend sends a retry for an operation that already succeeded, the backend catches the `DuplicateKeyError`, ignores it, and returns `200 OK` (SYNCED), preventing duplicate data and clearing the frontend queue.

## 2. Frontend Sync Architecture
**Stack:** Dexie (IndexedDB), Axios/Fetch, Zustand.

### The `syncQueue`
When the application is offline, all mutations (creating a reminder, saving a game result) are written to the local Dexie stores (e.g., `gameResults`, `reminders`).
Simultaneously, a `SyncQueueItem` is created in the `syncQueue` table with status `PENDING`.

```typescript
export interface SyncQueueItem {
  id: string;
  entityType: "GAME_RESULT" | "REMINDER" | "REMINDER_EVENT" | "ROUTINE" | "PATIENT_SETTINGS";
  entityId: string;
  operation: "CREATE" | "UPDATE" | "DELETE";
  patientId: string;
  payload: unknown;
  status: "PENDING" | "SYNCING" | "SYNCED" | "FAILED";
  // ...retry logic fields
}
```

### The Sync Engine (`syncService.ts`)
1. Reads all `PENDING` items (and `FAILED` items that are ready for retry).
2. Marks them `SYNCING`.
3. Sends them as a batch to `POST /sync`.
4. Updates the local queue based on the server's per-item response (`SYNCED` or `FAILED`).

### Retry Strategy
Exponential backoff is used for failed items: 5s, 10s, 20s, 40s, 60s, capped at 5 retries.
If an item fails permanently, it remains in the queue as `FAILED` for caregiver review, but never blocks the UI.

### Connectivity Service
Monitors `navigator.onLine`. When online, it actively probes `GET /health` to verify the backend is actually reachable before starting the sync engine.

## 3. Database Schema Mapping
| Domain | IndexedDB (Dexie) | MongoDB Collection |
|--------|-------------------|--------------------|
| App Meta | `meta` | `devices` |
| Sync State | `syncQueue` | `sync_events` |
| Games | `gameResults` | `game_results` |
| Reminders | `reminders` | `reminders` |
| Reminder log| `reminderEvents`| `reminder_events` |
| Routines | `routines` | `routines` |
| Settings | `settings` | `patient_settings` |

## 4. Conflict Resolution
For Phase 8, the conflict policy is:
- **Game Results:** Append-only (no conflicts).
- **Reminders / Routines:** Last-write-wins based on `updatedAt`.
Since this is primarily a single-user system (one tablet per elderly patient), true multi-master conflicts are extremely rare. The primary goal is ensuring data reaches the server exactly once.
