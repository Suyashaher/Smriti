# Phase 9 Audit

## Overview
This audit evaluates the existing Smriti codebase for Phase 9: Caregiver + Healthcare Worker Dashboard, Patient Monitoring, Alerts, and Analytics.

## Classification

### Frontend Caregiver UI
| Component | Status | Notes |
|-----------|--------|-------|
| `CaregiverLayout` | [COMPLETE] | Contains navigation and language selector. Requires updating to fetch active patient/alert counts if needed. |
| `CaregiverDashboardPage` | [PARTIAL] | Exists and uses Recharts. Currently fetches data locally from Dexie (hardcoded `DEMO_PATIENT`). Needs to switch to backend API. |
| `CaregiverPlaceholderPage` | [NEEDS FIX] | Currently mapped to `/patients`, `/trends`, `/games`, `/alerts`. Needs to be replaced with real pages. |
| `CaregiverRemindersPage` | [PARTIAL] | Exists but likely relies on local Dexie data. Needs backend integration. |
| `CaregiverRoutinesPage` | [PARTIAL] | Exists but relies on local Dexie data. |
| `CaregiverSettingsPage` | [PARTIAL] | Exists but relies on local Dexie data. |
| `SyncStatusIndicator` | [COMPLETE] | Added in Phase 8, shows offline/sync status. |
| Role Management | [MISSING] | `RequireCaregiver` exists but likely checks local store. No backend authorization yet. |

### Backend API
| Component | Status | Notes |
|-----------|--------|-------|
| `patients` Router | [PARTIAL] | Has basic CRUD. Missing `caregiver` assignment logic (`patient_caregiver` collection). |
| `games` Router | [COMPLETE] | Returns game results. |
| `reminders` Router | [COMPLETE] | Returns reminders and events. |
| `routines` Router | [COMPLETE] | Returns routines. |
| `analytics` Router | [MISSING] | No endpoints exist. Frontend currently does this via `patientPerformance.ts`. |
| `alerts` Router | [MISSING] | No endpoints exist. |
| Authentication | [MISSING] | Auth is deferred to Phase 11. Will need header-based mock auth for Caregiver assignment testing. |

### Analytics & Alerts
| Component | Status | Notes |
|-----------|--------|-------|
| `patientPerformance.ts` | [PARTIAL] | Calculates game scores and trends on frontend. Needs to move to backend `AnalyticsService`. |
| `AlertEngine` | [MISSING] | No logic for detecting missed reminders, drop in activity, etc. |
| `Alerts` Collection | [MISSING] | Needs to be added to `database.py`. |
| `Patient_Caregiver` | [MISSING] | Needs to be added to `database.py` to support patient assignment. |

## Conclusion
The frontend shell for the Caregiver exists, but relies on local IndexedDB data and placeholder pages. The backend has the raw data (from Phase 8 sync) but lacks the analytics aggregation, alert engine, and patient assignment logic required for Phase 9.

Phase 9 will focus on moving analytics to the backend, creating the Alert Engine, implementing patient assignment, and building out the missing React pages (`/caregiver/patients`, `/caregiver/alerts`, `/caregiver/patients/:id`).
