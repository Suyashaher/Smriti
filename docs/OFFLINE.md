# Offline-first behavior

The patient experience must not depend on FastAPI, MongoDB, or the public internet after the app has been loaded (or installed as a PWA).

## What must work without a network

- Launch the application
- Patient login / local session
- All five cognitive games
- Scoring and storing `GameResult` in IndexedDB
- Adaptive difficulty (`AdaptiveDifficultyEngine`)
- Reminders (create, complete, skip; visual fallback if notifications blocked)
- Daily routine view and mark complete
- Localized UI and local content packs (bundled assets)
- Progress and local activity history
- Voice **only if** `VoiceService.isAvailable()`; otherwise large buttons (`Voice unavailable` path)

## Data flow

```text
UI → Zustand → Dexie / IndexedDB
                 ↓ (when online)
            Sync queue
                 ↓
            FastAPI /sync
                 ↓
            MongoDB
```

Write local first. Enqueue a `syncQueue` item. Never block gameplay on sync.

## Sync queue item

```json
{
  "id": "uuid",
  "type": "GAME_RESULT",
  "patientId": "uuid",
  "timestamp": "ISO_DATE",
  "payload": {},
  "status": "PENDING"
}
```

Statuses: `PENDING` | `SYNCING` | `SYNCED` | `FAILED`.

Event types (initial): `GAME_RESULT`, `REMINDER_EVENT`, `ROUTINE_UPDATE`, `DEVICE_HEARTBEAT`, `MOOD_CHECK` (if implemented).

## Retry, idempotency, conflicts

- Retry with backoff; cap attempts; leave `FAILED` visible to caregiver as a **synchronization failure** alert, not a clinical alert.
- Idempotency: client `id` is the key; server unique index rejects duplicates (treat as success).
- Timestamps: store UTC ISO-8601; include `deviceId` on payloads.
- Conflicts: append-only game results; routines/reminders last-write-wins by `updatedAt` (caregiver wins ties). Document implementation in Phase 12.
- UI: failed sync never freezes the app; show a calm, non-technical status in caregiver mode.

## PWA and caching

Phase 2 will add `vite-plugin-pwa`. Precache app shell and bundled `content/` and `i18n` JSON. Runtime cache for optional API GETs; mutations always go through the queue.

## Notifications

Prefer `Notification` API when permission is granted. If denied or unsupported, use in-app **visual reminder** cards and optional sound via Web Audio (no dependency on network).

## Device identity

On first launch, generate `deviceId` (UUID) and persist in IndexedDB `meta`. Include in every sync event.

## Mandatory offline test (Phase 15+)

1. Turn off internet.
2. Open application.
3. Start a game.
4. Finish the game.
5. Save result (IndexedDB).
6. Create a reminder.
7. Complete the reminder.
8. Close the browser.
9. Reopen.
10. Verify game result and reminder state remain.
11. Reconnect internet.
12. Verify synchronization completes (queue → `SYNCED`).
13. Verify MongoDB contains the synchronized records (when backend is running).

Until the backend exists, steps 11–13 are deferred; steps 1–10 remain the patient-path contract from Phase 4 onward.

## Risks

- Service worker update bugs can serve stale shells — version `appVersion` in `meta` and document a hard refresh path in README later.
- Private/incognito IndexedDB may wipe on close — demo should use a normal profile.
- Browser notification permission is often denied on first visit — visual fallback is required, not optional.
