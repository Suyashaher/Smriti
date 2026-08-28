# Khasi language and NER content

Khasi is the **primary regional-language demonstration** for this MVP. The architecture must allow additional NER languages later **without changing application logic**—only new JSON locale files and content packs.

## Rules

1. **Every user-facing string** goes through i18n (`t('key')`). Do not hard-code English in components (Phase 7+).
2. **Do not invent Khasi.** If a native-validated string is not available, use a **placeholder** and mark it for human review.
3. English (`en.json`) is the source of truth for meaning and key names.
4. Do not assume any STT/TTS engine supports Khasi until a **verified** offline or licensed model is integrated. Until then, Khasi UI is visual; voice fallback is buttons ([ARCHITECTURE.md](ARCHITECTURE.md)).

## Planned files (Phase 7)

```text
frontend/src/i18n/
  en.json
  kh.json
```

Locale code: `kh` for Khasi in this project (document if a BCP-47 tag such as `kha` is adopted later).

## Placeholder convention

In `kh.json`, unverified values must be obvious to reviewers:

```text
"home.greetingMorning": "[KHASI: pending native validation] Good morning"
```

Optional metadata file (not required in Phase 1): `frontend/src/i18n/VALIDATION.md` listing keys still pending.

Never ship invented Khasi as if it were checked by a native speaker.

## String coverage (minimum)

Greetings, navigation, game instructions, scoring feedback, encouragement, reminders, routine, help, voice intent labels, caregiver (can stay English-first if caregiver locale is `en`, but keys still exist).

## Adding a language later

1. Add `frontend/src/i18n/{code}.json` with the same keys as `en.json`.
2. Register the locale in the i18n config (data, not scattered `if (lang)`).
3. Optionally add `content/{code}/` pack.
4. No game engine or API changes.

## Content packs

```text
content/
  generic/     # culturally neutral objects, foods, activities
  khasi/       # NER/Khasi-oriented items — only verified or clearly sourced lists
```

Support: local objects, foods, daily activities, images, terminology **without stereotyping**. Prefer empty or English labels in `khasi/` until a cultural consultant provides items. Do not invent “typical Khasi” tropes.

Images: store under `content/...` or `frontend/src/assets` with attribution in a `NOTICE` or README snippet when assets are added.

## Voice and Khasi

`VoiceService.isOfflineAvailable()` is `false` for Khasi until a verified model exists. UI copy: explain that buttons work; do not claim “Khasi voice AI” in the product.

## Review process

Hackathon: mark all `kh.json` entries pending unless a team member who speaks Khasi signs off (name/date in `KHASI.md` or VALIDATION log). Post-hackathon: replace placeholders; remove the `[KHASI: pending native validation]` prefix.
