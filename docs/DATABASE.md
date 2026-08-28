# Database

Two stores: **IndexedDB (Dexie)** on the device, **MongoDB** on the local backend. They are not the same schema 1:1, but domain entities align so sync can map them.

MongoDB is accessed **only** by FastAPI. Default:

```text
MONGODB_URI=mongodb://localhost:27017
MONGODB_DATABASE=eldercare_ai
```

Never hard-code credentials. Never expose MongoDB to the browser.

Do **not** add collections beyond those listed unless a later phase proves a hard need.

## Document conventions (MongoDB)

Every document should include:

- `_id` (ObjectId or UUID string — pick one convention in Phase 10 and stick to it)
- Domain `id` UUID where the client generates identity (games, reminders, sync events)
- `createdAt`, `updatedAt` (ISO-8601 UTC)

## MongoDB collections

### users

Authentication identity.

Suggested fields: `id` (UUID), `email` or `username`, `passwordHash`, `role` (`PATIENT` | `CAREGIVER` | `HEALTHCARE_WORKER` | `ADMIN`), `preferredLanguage`, `createdAt`, `updatedAt`.

Indexes: unique on login identifier; `role`.

### patients

Profile for elderly users (may link `userId`).

Suggested fields: `id`, `userId`, `displayName`, `preferredLanguage`, `contentPack` (`generic` | `khasi`), `createdAt`, `updatedAt`.

Indexes: `userId`.

### caregivers

Suggested fields: `id`, `userId`, `displayName`, `createdAt`, `updatedAt`.

Indexes: `userId`.

### patient_caregiver

Many-to-many link.

Suggested fields: `id`, `patientId`, `caregiverId`, `createdAt`, `updatedAt`.

Indexes: `patientId`, `caregiverId`, unique compound `(patientId, caregiverId)`.

### game_sessions

Optional session wrapper if a game spans multiple rounds.

Suggested fields: `id`, `patientId`, `gameId`, `startedAt`, `endedAt`, `difficulty`, `createdAt`, `updatedAt`.

Indexes: `patientId`, `gameId`, `startedAt`.

### game_results

Canonical result (same shape as client JSON).

Suggested fields: `id` (UUID), `patientId`, `gameId`, `score`, `accuracy`, `responseTime`, `attempts`, `difficulty`, `completed`, `timestamp`, `deviceId`, `syncedAt`, `createdAt`, `updatedAt`.

Indexes: `patientId`, `gameId` (game type), `timestamp`, `deviceId`.

Idempotency: unique index on client `id` so retries do not duplicate.

### cognitive_metrics

Aggregated or snapshot metrics (memory, attention, pattern, engagement, consistency). Non-diagnostic.

Suggested fields: `id`, `patientId`, `period` (`day` | `7d` | `30d`), `scores` (object), `computedAt`, `createdAt`, `updatedAt`.

Indexes: `patientId`, `computedAt`.

### reminders

Suggested fields: `id`, `patientId`, `type` (`medicine` | `hydration` | `meal` | `activity` | `appointment`), `titleKey` or localized payload, `schedule`, `createdAt`, `updatedAt`.

Indexes: `patientId`.

### reminder_events

Occurrence instances.

Suggested fields: `id`, `reminderId`, `patientId`, `scheduledAt`, `status` (`scheduled` | `completed` | `skipped` | `missed`), `completedAt`, `createdAt`, `updatedAt`.

Indexes: `patientId`, `scheduledAt`, `status`.

### daily_routines

Suggested fields: `id`, `patientId`, `items` (ordered list: time, titleKey, icon, sortOrder), `createdAt`, `updatedAt`.

Indexes: `patientId`.

### alerts

Caregiver-facing, non-clinical.

Suggested fields: `id`, `patientId`, `type` (`missed_reminders` | `activity_change` | `sync_failure` | `device_inactivity`), `messageKey` / params, `severity`, `readAt`, `createdAt`, `updatedAt`.

Indexes: `patientId`, `createdAt`, `type`.

### devices

Suggested fields: `deviceId` (UUID, unique), `patientId` (optional until bound), `lastSyncAt`, `appVersion`, `language`, `createdAt`, `updatedAt`.

Indexes: unique `deviceId`; `patientId`; `lastSyncAt`.

### sync_events

Server-side log of ingested queue items (optional duplicate of client queue for audit).

Suggested fields: `id` (client event UUID), `type`, `patientId`, `deviceId`, `timestamp`, `status`, `payloadHash`, `createdAt`, `updatedAt`.

Indexes: unique `id`; `patientId`; `status`; `timestamp`.

### audit_logs

Suggested fields: `id`, `actorUserId`, `action`, `resourceType`, `resourceId`, `ip` (if available), `createdAt`.

Indexes: `actorUserId`, `createdAt`.

`updatedAt` may equal `createdAt` if logs are immutable.

## IndexedDB (Dexie) — client sketch

Versioned Dexie database, e.g. `eldercare_offline`.

Proposed tables (Phase 4):

| Table | Role |
|-------|------|
| `meta` | `deviceId`, `lastSyncAt`, `appVersion`, `language`, local session |
| `gameResults` | Same JSON as spec §10; `synced` boolean |
| `syncQueue` | `id`, `type`, `patientId`, `timestamp`, `payload`, `status` |
| `reminders` / `reminderEvents` | Local-first reminder data |
| `routines` | Daily routine items |
| `contentCache` | Optional copy of selected content pack |
| `settings` | Theme, language, voice prefs |

Indexes to plan: `patientId`, `timestamp`, `status` (sync), `gameId`.

## Mapping and conflict (summary)

- Client generates UUIDs for results, reminders, and queue items.
- Server unique index on those UUIDs = duplicate prevention.
- Conflict policy for concurrent caregiver vs patient edits of the same routine: **last-write-wins by `updatedAt`**, with caregiver write winning if timestamps equal (document in sync service, Phase 12). Game results are append-only (no conflict).

## Indexes checklist (MongoDB)

Create indexes for: `patientId`, `caregiverId`, `timestamp` / `scheduledAt` / `createdAt`, sync `status`, `gameId` / game type — as listed per collection above.
