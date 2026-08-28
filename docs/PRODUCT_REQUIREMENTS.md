# Product requirements

Hackathon MVP aligned with **Problem Statement 26003 — MDoNER**: AI-based cognitive gaming and memory assistance for elderly people in the North Eastern Region (NER), with a Khasi-ready demonstration.

## Problem we solve

Many older adults in NER face gaps in accessible, language-appropriate cognitive engagement and day-to-day memory support. Caregivers need a simple view of activity, reminders, and changes in engagement—without a clinical system.

This product is a **wellness and assistance** tool, not a medical device.

## Explicit non-goals

- No diagnosis, treatment, cure, or prediction of dementia or any disease
- No claims that scores measure “brain health” as a medical finding
- No invented Khasi copy presented as verified native language
- No fake patient medical records presented as real
- No Firebase, Supabase, or cloud-hosted database for the MVP
- No React Native; primary app is a React PWA

## Users

| User | Needs |
|------|--------|
| Patient (elderly) | Calm, high-contrast UI; games; routine; reminders; optional voice; Khasi/English |
| Caregiver | Dashboard, patient list, trends, missed reminders, alerts, routine editing |
| Healthcare worker / admin (later) | Same caregiver surfaces with broader access; audit |

## Modes

### Elderly mode

Screens: Home, Cognitive Games, Today's Routine, Reminders, Progress, Voice Assistant, Help.

Home (illustrative, copy via i18n): greeting, mood check (few large choices), then four primary actions: play game, reminders, routine, assistant.

### Caregiver mode

Dashboard, Patients, Patient Profile, Cognitive Trends, Game History, Reminder Monitoring, Alerts, Routine Management, Settings.

## Functional requirements (MVP)

1. **Offline-first patient app** — launch, session, games, scoring, adaptive difficulty, reminders, routine, local language content, history (see [OFFLINE.md](OFFLINE.md)).
2. **Five games** — memory cards, object recognition, pattern recognition, daily routine recall, attention; shared result schema stored in IndexedDB first.
3. **Adaptive difficulty** — on-device rules; human-readable reason; not diagnostic.
4. **Performance analytics** — Memory, Attention, Pattern Recognition, Engagement, Consistency; 0–100 **Cognitive Performance Score** / **Activity Performance Score**; Today / 7 days / 30 days; text under charts.
5. **Reminders** — medicine, hydration, meals, daily activities, appointments; `scheduled` / `completed` / `skipped` / `missed`; Notification API + visual fallback.
6. **Daily routine** — caregiver CRUD + reorder; patient marks complete; local-first.
7. **i18n + Khasi architecture** — all UI strings localized; placeholders until native validation ([KHASI.md](KHASI.md)).
8. **Cultural content packs** — `content/generic` and `content/khasi`; configurable, not stereotyped.
9. **Voice abstraction** — optional; fallback to buttons; no fake offline Khasi STT/TTS.
10. **Caregiver dashboard** — totals, activity, missed reminders, alerts; patient profile fields as specified.
11. **Alerts** — missed reminders, activity change, sync failure, device inactivity; non-clinical wording.
12. **Local FastAPI + MongoDB** — auth, sync, audit; JWT; roles.
13. **Device UUID** — for sync identity.
14. **Demo data** — clearly labeled DEMO; not real patients.

## User journeys (demo)

**Patient:** Open app → Khasi (or English) → today's routine → play memory game → engine adjusts difficulty → medicine reminder → activity stored offline.

**Caregiver:** Login → select patient → activity → performance trends → missed reminders → alerts.

**Offline:** Internet off → games/reminders/Khasi UI/local store work → internet on → sync → MongoDB updated → caregiver sees latest.

## Quality attributes

- Elderly-friendly: large fonts/buttons, high contrast, few choices, clear feedback, limited animation
- Accessible: charts have text summaries; no tiny hit targets in elderly mode
- Secure: secrets in `.env` only; no Mongo credentials in the frontend
- Modular and testable: games, engine, sync, auth isolated
- Capacitor-ready later: no browser-only assumptions that block a WebView wrap

## Phased delivery

| Phase | Focus |
|-------|--------|
| 1 | Docs + folders (this milestone) |
| 2 | React foundation, elderly design system, PWA shell |
| 3 | Five games (offline) |
| 4 | Dexie persistence |
| 5 | Adaptive difficulty |
| 6 | Reminders and routine |
| 7 | i18n + Khasi content architecture |
| 8 | Voice abstraction |
| 9–11 | FastAPI, MongoDB, auth |
| 12 | Sync |
| 13–14 | Caregiver UI, analytics, alerts |
| 15 | Security, tests, a11y, performance |

## Success for the hackathon

Judges can complete the three journeys above on a laptop with local MongoDB optional for the patient-only path, required for full caregiver sync demo.
