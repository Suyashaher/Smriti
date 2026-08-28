# Phase 6 — Khasi + Multilingual + Cultural Localization Audit

**Audit Date:** 2026-08-27  
**Auditor:** Antigravity Documentation Team  
**Scope:** Khasi Localization, Multilingual Architecture, Catalogs, and Cultural Content Integrity  
**Codebase Version:** 0.1.0  

---

## 1. Executive Summary

Phase 6 focuses on multilingual capabilities and cultural localization, with Khasi (*Ka Ktien Khasi*) serving as the primary regional demonstration language for North Eastern India.

The project features a lightweight, zero-dependency i18n architecture implemented in `src/i18n/index.ts` combined with reactive state persistence via Zustand and IndexedDB. However, a comprehensive audit of the localization infrastructure reveals critical gaps in catalog parity, placeholder saturation, un-keyed UI strings, and missing translation calls.

| Metric / Area | Current Status | Details |
| :--- | :--- | :--- |
| **English Catalog (`en.json`)** | 169 Keys | Source of truth; contains primary strings across app, games, routine, reminders, progress, and caregiver modules. |
| **Khasi Catalog (`kh.json`)** | 149 Keys | 20 keys missing compared to `en.json` (primarily in `progress` and `caregiver` analytics). |
| **Khasi Translation Completeness** | 0% Real Translations | 0 actual verified Khasi translations; 100% of values are placeholder strings prefixed with `[KHASI: pending native validation]` or `[KHASI]`. |
| **Missing Catalog Keys Called in Code** | 6 Identified Keys | Keys referenced via `t()` in components but entirely omitted from both `en.json` and `kh.json`. |
| **Hard-Coded English Strings in Components** | 4 Locations Found | Action buttons, status labels, and browser notification payloads circumventing `t()` translation calls. |
| **Accessibility Localization (Aria)** | Incomplete | Icon-only action buttons in Caregiver views lack localized `aria-label` tags for screen readers. |

---

## 2. Existing i18n Architecture

The internationalization architecture of Smriti is intentionally decoupled and designed to operate entirely offline with zero runtime dependency overhead:

```
┌─────────────────────────────────────────────────────────────┐
│                       Zustand uiStore                       │
│  - locale: 'en' | 'kh'                                      │
│  - setLocale(code) -> persists to IndexedDB & updates DOM   │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌──────────────────────────────┐    ┌──────────────────────────────┐
│     useTranslation Hook      │    │   LanguageSelector.tsx       │
│  - locale                    │    │   - Large tactile buttons    │
│  - t(key): string            │    │   - High-contrast toggle     │
└──────────────┬───────────────┘    └──────────────────────────────┘
               ▼
┌─────────────────────────────────────────────────────────────┐
│                   translate() in i18n/index.ts              │
│  1. Check catalogs[locale][path] (dot-notation lookup)       │
│  2. Fallback to catalogs.en[path]                           │
│  3. Fallback to path string if missing in both catalogs     │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
┌──────────────────────────────┐    ┌──────────────────────────────┐
│  Static JSON Catalogs        │    │  Game & Content Packs        │
│  - src/i18n/en.json          │    │  - src/games/content/        │
│  - src/i18n/kh.json          │    │    generic.ts (labelKey)     │
└──────────────────────────────┘    └──────────────────────────────┘
```

### Core Architecture Components

1. **Translation Engine (`src/i18n/index.ts`)**:
   - `translate(locale: LocaleCode, path: string): string`: Traverses nested JSON catalog trees using dot-notation keys (e.g., `reminders.actionDone`).
   - Implements two-tier fallback: if a key is missing or non-string in the target locale, it falls back to `catalogs.en`. If missing in `en`, it returns the raw key path string.
   - Exports `supportedLocales: LocaleCode[] = ["en", "kh"]`.

2. **Translation Hook (`src/hooks/useTranslation.ts`)**:
   - Consumes `useUiStore` to extract current active `locale`.
   - Returns `{ locale, t: (key: string) => translate(locale, key) }` for functional React components.

3. **Locale State & Persistence (`src/store/uiStore.ts` & `src/db/init.ts`)**:
   - `locale` defaults to `"en"`.
   - `setLocale(locale)` asynchronously persists the preference to Dexie IndexedDB via `persistLanguage(locale)` in `systemSettings` table and synchronizes `document.documentElement.lang = locale === "kh" ? "kha" : "en"`.

4. **Language Selector (`src/components/LanguageSelector.tsx`)**:
   - Provides accessible, large, elderly-friendly toggle buttons styled with high-contrast active rings and `aria-pressed` states.
   - Allows switching between English and Khasi seamlessly from the elderly homepage and setup screens.

5. **Type Safety (`src/types/index.ts`)**:
   - `export type LocaleCode = "en" | "kh";` guarantees strict typing across stores, components, and catalogs.

6. **Content Pack & Game Decoupling (`src/games/content/generic.ts`)**:
   - Content items (`GENERIC_ITEMS`), routine milestones (`DEFAULT_ROUTINE`), and pattern colors (`PATTERN_COLORS`) use abstract `labelKey` identifiers (e.g., `content.cup`, `content.apple`, `content.wake`).
   - Prevents hardcoding English or cultural bias in game engine logic, allowing dynamic resolution via `t(item.labelKey)`.

---

## 3. Catalog Status & Parity Analysis

A comparative inspection between `src/i18n/en.json` and `src/i18n/kh.json` reveals significant drift:

### Catalog Statistics

- **`en.json` Total Keys:** 169
- **`kh.json` Total Keys:** 149
- **Missing Keys in `kh.json`:** 20 keys (11.8% catalog deficit)
- **Verified Khasi Translations:** 0 (100% placeholder coverage)

### Missing Keys in `kh.json` Breakdown

The 20 keys missing from `kh.json` were added during Phase 4 and Phase 5 feature development:

#### 1. Progress & Trend Analytics (9 Keys Missing)
- `progress.overallLabel` ("Activity score")
- `progress.gamesPlayedLabel` ("Games played")
- `progress.trendImproving` ("Your activity is improving! 🌟")
- `progress.trendStable` ("You're doing steadily. Keep it up! 🌟")
- `progress.trendDeclining` ("Recent scores are a little lower. That's okay — let's try together.")
- `progress.trendInsufficient` ("Play a few more games to see your activity trend.")
- `progress.perGameTitle` ("Your games")
- `progress.sessions` ("times played")
- `progress.recentHistory` ("Recent activity")

#### 2. Caregiver Dashboard & Trend Metrics (11 Keys Missing)
- `caregiver.overallScore` ("Activity score")
- `caregiver.gamesPlayed` ("Games played")
- `caregiver.recentTrend` ("Recent trend")
- `caregiver.trendLabel_improving` ("Improving")
- `caregiver.trendLabel_stable` ("Stable")
- `caregiver.trendLabel_declining` ("Needs attention")
- `caregiver.trendLabel_insufficient_data` ("Not enough data")
- `caregiver.perGameTitle` ("Per-game activity")
- `caregiver.difficulty` ("Level")
- `caregiver.score` ("Score")
- `caregiver.sessionsCount` ("Sessions")

---

## 4. Bugs and Localization Anomalies Found

### Bug 1: Missing Catalog Keys Referenced in Application Code (6 Keys)

Six keys are invoked via `t("...")` in React components but do not exist in either `en.json` or `kh.json`, leading to raw key strings rendering in the UI:

1. **`home.nextReminder`** — Called in `src/pages/elderly/ElderlyHomePage.tsx` (Line 98) for the upcoming reminder card header.
2. **`home.viewReminder`** — Called in `src/pages/elderly/ElderlyHomePage.tsx` (Line 108) on the quick navigation button.
3. **`caregiver.activeReminders`** — Called in `src/pages/caregiver/CaregiverRemindersPage.tsx` (Line 42) for the reminder list section header.
4. **`caregiver.addReminder`** — Called in `src/pages/caregiver/CaregiverRemindersPage.tsx` (Line 48) on the create reminder button.
5. **`caregiver.dailyRoutine`** — Called in `src/pages/caregiver/CaregiverRoutinesPage.tsx` (Line 62) for the routine list header.
6. **`caregiver.addRoutine`** — Called in `src/pages/caregiver/CaregiverRoutinesPage.tsx` (Line 68) on the add routine step button.

### Bug 2: Hard-Coded English Strings in `ReminderCard.tsx`

`src/components/ReminderCard.tsx` contains hard-coded user-facing English text bypassing the i18n system:
- Line 46: `{isMissed && " (Missed)"}` — Appends raw English text to scheduled time.
- Line 60: `<X size={24} /> Skip` — Hard-coded button label.
- Line 69: `<Check size={24} /> Done` — Hard-coded button label.

### Bug 3: Raw `titleKey` Rendering in `ActiveReminderModal.tsx`

In `src/components/ActiveReminderModal.tsx` (Line 26), the reminder title is rendered as:
```tsx
<p className="text-5xl font-extrabold text-elder-ink leading-tight">
  {activeReminder.titleKey /* We can translate this in a real scenario */}
</p>
```
This directly outputs the un-translated key string (e.g. `"reminders.type.medicine"`) rather than calling `t(activeReminder.titleKey)`.

### Bug 4: Hard-Coded English Notifications in `reminderStore.ts`

In `src/store/reminderStore.ts` (Lines 94–96), browser push/desktop notifications trigger hard-coded English strings:
```ts
sendNativeNotification("Reminder Time!", {
  body: "It's time for your reminder.",
});
```
This bypasses user locale preferences and fails to deliver regional alerts.

### Bug 5: Missing `aria-label` Attributes on Caregiver Action Buttons

Several icon-only buttons in the Caregiver interface lack localized `aria-label` attributes, impacting screen reader accessibility:
- `src/pages/caregiver/CaregiverRemindersPage.tsx` (Line 65): Delete button `<button onClick={() => handleDelete(r.id)}><Trash2 size={20} /></button>` lacks `aria-label`.
- `src/pages/caregiver/CaregiverRoutinesPage.tsx` (Lines 83–85): Reorder and delete buttons (`ArrowUp`, `ArrowDown`, `Trash2`) lack `aria-label` descriptions.

---

## 5. Classification Table of Audit Findings

| Area / Component | Finding Description | Status | Severity / Impact |
| :--- | :--- | :--- | :--- |
| **i18n Lookup Engine** | Dot-notation traversal with English fallback in `i18n/index.ts` | **[COMPLETE]** | Low / Working as intended |
| **Locale State Store** | `useUiStore` persistence to Dexie DB and `document.documentElement.lang` sync | **[COMPLETE]** | Low / Working as intended |
| **Language Switcher UI** | Accessible, large-touch button interface (`LanguageSelector.tsx`) | **[COMPLETE]** | Low / Working as intended |
| **Game Content Abstraction** | Generic item content packs use `labelKey` identifiers | **[COMPLETE]** | Low / Working as intended |
| **Catalog Parity** | `kh.json` is missing 20 keys present in `en.json` (progress & caregiver) | **[PARTIAL]** | High / Khasi users receive English fallbacks |
| **Khasi Translations** | All 149 keys in `kh.json` are placeholder strings | **[PARTIAL]** | Critical / No genuine Khasi translations |
| **Catalog Key Integrity** | 6 keys used in `ElderlyHomePage` and Caregiver pages missing from all catalogs | **[MISSING]** | High / Raw key paths rendered to users |
| **Reminder Card UI** | `ReminderCard.tsx` hard-codes "Done", "Skip", "(Missed)" in English | **[NEEDS_FIX]** | High / Bypasses locale switching |
| **Reminder Modal Display** | `ActiveReminderModal.tsx` renders raw `titleKey` without `t()` | **[NEEDS_FIX]** | High / Displays raw dot-notation string |
| **Desktop Notifications** | `reminderStore.ts` hard-codes notification title and body in English | **[NEEDS_FIX]** | Medium / Notification text not localized |
| **Caregiver Icon Buttons** | Reorder and Delete buttons lack localized `aria-label` properties | **[NEEDS_FIX]** | Medium / Accessibility deficiency |
| **Cultural Content Validation**| Object recognition items require cultural relevance check for Meghalaya/NER | **[NEEDS_FIX]** | Medium / Cultural resonance |

---

## 6. Recommendations

1. **Synchronize Catalog Keys**:
   - Add the 6 missing keys (`home.nextReminder`, `home.viewReminder`, `caregiver.activeReminders`, `caregiver.addReminder`, `caregiver.dailyRoutine`, `caregiver.addRoutine`) to `en.json`.
   - Propagate all 26 missing/new keys to `kh.json`.

2. **Refactor Hard-Coded Components**:
   - Update `ReminderCard.tsx` to use `t("reminders.actionDone")`, `t("reminders.actionSkip")`, and localized missed status indicators.
   - Fix `ActiveReminderModal.tsx` to wrap `activeReminder.titleKey` with `t()`.
   - Update `reminderStore.ts` to retrieve localized strings before triggering `sendNativeNotification()`.

3. **Accessibility Remediation**:
   - Add keys `common.delete`, `common.moveUp`, `common.moveDown` to catalogs and wire them into `aria-label` attributes on caregiver action buttons.

4. **Native Khasi Validation Process**:
   - Engage a native Khasi speaker from Meghalaya to review and replace placeholder strings against `KHASI_GLOSSARY.md` and `KHASI_VALIDATION_CHECKLIST.md`.
   - Verify orthographic conventions, including the use of Khasi diacritics (`ï`, `ñ`).

5. **Cultural Content Enrichment**:
   - Extend `src/games/content/` to support regional Khasi objects, foods, and utensils (e.g., Kwai/Betel nut, Jadoh, Sohphie, Khasi traditional baskets) alongside generic items.
