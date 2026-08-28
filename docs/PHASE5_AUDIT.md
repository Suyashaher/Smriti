# Phase 5 — Reminders, Routines, and Notifications Audit

**Audit Date:** 2026-08-27  
**Auditor:** Antigravity  
**Codebase Version:** 0.1.0

---

## 1. Executive Summary

| Area | Status | Summary |
| :--- | :--- | :--- |
| **Dexie Schema for Reminders/Routines** | **[COMPLETE]** (Schema only) | Tables `reminders`, `reminderEvents`, and `routines` are defined in `EldercareDatabase` (Dexie v1) with indexes. |
| **Dexie CRUD / Store Services** | **[MISSING]** | No helper services (e.g., `reminders.ts`, `routines.ts`) exist in `src/db/` to create, read, update, complete, or skip reminders or routines. |
| **TypeScript Domain Types** | **[PARTIAL]** | Basic record types exist in `src/db/database.ts`, but no shared domain types exist in `src/types/index.ts` (e.g., reminder categories, frequency rules, snooze state). |
| **Elderly Reminders Page** | **[PLACEHOLDER]** | `ElderlyRemindersPage.tsx` only renders `ElderlyHeader` + `EmptyState`. |
| **Elderly Routine Page** | **[PLACEHOLDER]** | `ElderlyRoutinePage.tsx` only renders `ElderlyHeader` + `EmptyState`. |
| **Elderly UI Components** | **[PARTIAL]** | `ReminderCard.tsx` and `RoutineItem.tsx` exist as static dumb presentation components. They lack interactive checkmarks, complete/skip/snooze actions, or sound triggers. |
| **Caregiver Reminder & Routine Pages** | **[PLACEHOLDER]** | `/caregiver/reminders` and `/caregiver/routines` route to `CaregiverPlaceholderPage`. No CRUD, time-pickers, or patient assignment UI. |
| **Web Notifications API** | **[MISSING]** | No `Notification.requestPermission()`, `new Notification()`, or push notification handlers exist in frontend code. |
| **Audio / Visual Alarm / Snooze** | **[MISSING]** | Zero alarm audio synthesis (Web Audio API), ringer tones, alarm intervals, or snooze state handling in codebase. |
| **Scheduling Engine** | **[MISSING]** | No runtime timer, cron, `setInterval`, Web Worker, or Dexie query scheduling occurrences for today. |
| **PWA & Service Worker** | **[PARTIAL]** | `vite-plugin-pwa` precaches app assets and registers service worker on app startup via `virtual:pwa-register`. No custom service worker scripts for notifications or background sync. |
| **i18n Localization** | **[PARTIAL]** | Baseline keys exist in `en.json` and `kh.json` for titles and empty states; missing keys for reminder types, status labels, actions (complete, skip, snooze, edit, delete), and alert messages. |

---

## 2. File-by-File Details

### Data Models & Local Storage
- `frontend/src/db/database.ts`: Contains `ReminderRecord`, `ReminderEventRecord`, `RoutineRecord` interfaces and Dexie table definitions (`reminders`, `reminderEvents`, `routines`). **[COMPLETE]** schema, but no CRUD operations implemented.
- `frontend/src/types/index.ts`: Does not export domain types for reminders, routines, or statuses. **[MISSING]**
- `docs/DATABASE.md` and `docs/OFFLINE.md`: Architecturally specifies reminders and events sync queues. **[COMPLETE]**

### Elderly UI
- `frontend/src/pages/elderly/ElderlyRemindersPage.tsx`: Static placeholder. **[PLACEHOLDER]**
- `frontend/src/pages/elderly/ElderlyRoutinePage.tsx`: Static placeholder. **[PLACEHOLDER]**
- `frontend/src/components/ReminderCard.tsx`: Static presentation card. Lacks actions. **[PARTIAL]**
- `frontend/src/components/RoutineItem.tsx`: Static item with line-through on completion. Lacks interactive toggles. **[PARTIAL]**
- `frontend/src/pages/elderly/ElderlyHomePage.tsx`: Has navigation to Reminders and Routine but no active/upcoming preview. **[PARTIAL]**

### Caregiver UI
- `frontend/src/pages/caregiver/CaregiverPlaceholderPage.tsx`: Currently serves routes for `/caregiver/reminders`, `/caregiver/routines`, and `/caregiver/alerts`. **[PLACEHOLDER]**

### Notifications & Scheduling
- No Notification API implementation or permission flows. **[MISSING]**
- No scheduler hook to check for due reminders or missed events. **[MISSING]**
- No Web Audio for fallback alerts. **[MISSING]**

### Localization
- `frontend/src/i18n/en.json` & `kh.json`: Contain some navigation and page titles but lack action labels, category labels, notification copy, and statuses. **[PARTIAL]**

---

## 3. Preservation Strategy
- **Database Schema**: Preserve the existing Dexie schema in `database.ts` (v1). Build CRUD functions on top of it without changing the table definitions.
- **Routing**: Keep the existing `/elderly/reminders`, `/elderly/routine`, `/caregiver/reminders`, and `/caregiver/routines` routes.
- **UI Architecture**: Expand `ReminderCard` and `RoutineItem` while maintaining their elderly-friendly high-contrast styles.
- **Offline-first Sync Queue**: Any reminder action (complete, skip, snooze) should generate a `SyncQueueItem` following the pattern in `docs/OFFLINE.md`.
