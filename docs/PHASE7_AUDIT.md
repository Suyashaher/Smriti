# Phase 7 — Voice and Speech Infrastructure Audit

**Audit Date:** 2026-08-27  
**Auditor:** Antigravity Documentation Team  
**Scope:** Voice / Speech Infrastructure, STT/TTS Providers, Command Processing, and UI Integration  
**Codebase Version:** 0.1.0  

---

## 1. Executive Summary

Prior to Phase 7, the voice capabilities within Smriti were strictly placeholder-only. While the project vision highlighted voice-assisted navigation and audio cues for elderly dementia patients in North Eastern India, no actual speech recognition (`SpeechRecognition`), speech synthesis (`SpeechSynthesis`), or voice orchestrator layer was functional in the runtime code.

Phase 7 introduces an end-to-end, provider-independent voice architecture. It wraps browser speech capabilities into a unified service layer, defines extensible interfaces for future offline neural models, integrates an 8-command speech recognition engine with fuzzy matching, updates the UI components with multi-state accessible feedback, and honestly documents the technical and regional realities of speech recognition in the North Eastern context.

### Key Pre-Phase 7 vs. Post-Phase 7 Summary

| Dimension | Pre-Phase 7 Baseline | Post-Phase 7 State |
| :--- | :--- | :--- |
| **Speech-to-Text (STT)** | None (VoiceButton disabled/MicOff) | Implemented via `BrowserVoiceProvider` (Web Speech API) with English recognition and cloud fallback |
| **Text-to-Speech (TTS)** | None (Static UI text only) | Implemented via `SpeechSynthesisService` with local OS voice detection and elderly speed regulation |
| **Command Processing** | None | 8 normalized voice commands with exact, contains, and Levenshtein fuzzy matching ($\le 3$) |
| **State & Store Management** | None | Reactive Zustand store (`useVoiceStore`) syncing preferences to Dexie IndexedDB |
| **Khasi Language Support** | Placeholder strings in `kh.json` | Catalog keys structured, 8 Khasi command phrases cataloged, honestly documented as awaiting future ASR models |
| **Offline Reality** | Web Audio chime only | TTS works offline (via OS local voices); STT is cloud-dependent (browser Web Speech API); fallback buttons always available |

---

## 2. Pre-existing Components Analysis

A thorough audit of the codebase prior to Phase 7 identified the following assets and limitations:

1. **`audioService.ts` [COMPLETE]**:
   - Implemented a zero-dependency Web Audio API synthesizer (`initAudio()`, `playReminderChime()`).
   - Synthesizes a pleasant two-tone chime (C5 at 523.25 Hz followed by E5 at 659.25 Hz) with linear attack and exponential decay.
   - Fully functional and preserved without modification.

2. **`notificationService.ts` [COMPLETE]**:
   - Handled browser `Notification` permissions, service worker push notifications, and automatic audio chime playback.
   - Fully functional and preserved without modification.

3. **`VoiceButton.tsx` [PLACEHOLDER / NEEDS_FIX]**:
   - Rendered a static, non-interactive button that was permanently disabled or displayed a `MicOff` icon.
   - Lacked visual feedback states for listening, processing, success, or error conditions.

4. **`ElderlyAssistantPage.tsx` [PLACEHOLDER / NEEDS_FIX]**:
   - Rendered static copy indicating that voice was unavailable on the device.
   - Contained no listeners, event hooks, speech dispatchers, or dynamic transcript containers.

5. **`SettingsRecord.voiceEnabled` [PARTIAL]**:
   - The field `voiceEnabled: boolean` existed in `src/types/index.ts` and was saved in the Dexie IndexedDB `systemSettings` table.
   - However, no caregiver or elderly UI toggle existed to allow users to configure or test voice input/output.

6. **i18n Voice Keys [COMPLETE]**:
   - Localization catalogs (`src/i18n/en.json` and `src/i18n/kh.json`) contained baseline keys for `assistant.*`, `voice.*`, and `voiceFeedback.*`.

7. **Voice Provider & Engine Code [MISSING]**:
   - Zero implementation code existed for `SpeechRecognition`, `webkitSpeechRecognition`, `SpeechSynthesis`, `SpeechSynthesisUtterance`, utterance queues, transcript parsing, or capability introspection.

---

## 3. Component Classification Table

The table below catalogs each component and subsystem evaluated during the Phase 7 audit:

| Component / Subsystem | Path / Area | Status | Audit Findings & Description |
| :--- | :--- | :--- | :--- |
| **Audio Synthesis Service** | `src/services/audioService.ts` | **[COMPLETE]** | Web Audio API dual-tone chime synthesizer for alert cues. |
| **Notification Service** | `src/services/notificationService.ts` | **[COMPLETE]** | Web Notification API dispatcher with audio chime fallback. |
| **Voice Button Component** | `src/components/VoiceButton.tsx` | **[NEEDS_FIX]** | Was a static placeholder; required 6-state accessible redesign. |
| **Elderly Assistant Page** | `src/pages/elderly/ElderlyAssistantPage.tsx` | **[NEEDS_FIX]** | Was a static empty view; required live voice session integration. |
| **Voice Service Layer** | `src/services/voice/VoiceService.ts` | **[MISSING]** | No provider-independent orchestration layer existed. |
| **Voice State Store** | `src/store/voiceStore.ts` | **[MISSING]** | No Zustand store existed for voice lifecycle and transcripts. |
| **React Voice Hook** | `src/hooks/useVoice.ts` | **[MISSING]** | No high-level React hook existed for component integration. |
| **Game Voice Integration** | `src/pages/elderly/games/` | **[MISSING]** | No audio prompts or spoken reinforcement during gameplay. |
| **Reminder Voice Integration** | `src/components/ActiveReminderModal.tsx` | **[MISSING]** | No spoken announcement when medication/hydration reminders trigger. |
| **Voice Settings UI** | `src/pages/caregiver/CaregiverSettingsPage.tsx` | **[MISSING]** | No toggles for master voice, speech rate, or microphone input. |
| **Capability Detection** | `src/services/voice/VoiceService.ts` | **[MISSING]** | No runtime introspection of browser STT/TTS or offline voices. |
| **Voice Command System** | `src/services/voice/VoiceCommandService.ts` | **[MISSING]** | No phrase registry, command tokenizer, or fuzzy match algorithms. |

---

## 4. What Was Preserved

To maintain codebase stability and avoid regressions:
- **`src/services/audioService.ts`**: Preserved completely without modification. Continues to provide zero-dependency Web Audio chime synthesis for notifications and reminder triggers.
- **`src/services/notificationService.ts`**: Preserved completely without modification. Retains service worker and standard notification dispatch flows.
- **Dexie Database Schema (`src/db/database.ts`)**: Preserved existing table structures while utilizing the `systemSettings` store for persisting voice configuration preferences.
- **i18n Translation Foundation (`src/i18n/`)**: Preserved the zero-dependency dot-notation lookup engine and added new voice-specific keys without breaking existing catalogs.

---

## 5. What Was Added in Phase 7

Phase 7 introduced a complete voice subsystem located in `src/services/voice/`, along with state stores, React hooks, and updated user interfaces:

### New Core Voice Services (`frontend/src/services/voice/`)

1. **`types.ts`**:
   - Declares provider-agnostic interfaces: `VoiceProvider`, `STTResult`, `TTSOptions`, and `VoiceInfo`.
   - Defines language mapping dictionaries (`LOCALE_TO_BCP47`) and default elderly-friendly speech synthesis options (`DEFAULT_TTS_OPTIONS`).

2. **`BrowserVoiceProvider.ts`**:
   - Implements `VoiceProvider` over the browser Web Speech API.
   - Encapsulates `SpeechRecognition` / `webkitSpeechRecognition` for speech-to-text.
   - Encapsulates `window.speechSynthesis` for text-to-speech, enumerating local OS voices for offline speech output.
   - Explicitly flags connectivity dependency (`connectivityDependent = true`).

3. **`SpeechSynthesisService.ts`**:
   - High-level text-to-speech wrapper supporting direct text or localized i18n keys via `translate()`.
   - Manages utterance cancellation and queueing to prevent overlapping speech.
   - Applies an elderly-optimized speech rate (default 0.85x, configurable 0.3x–2.0x).
   - Designed to fail gracefully and non-blockingly without throwing uncaught exceptions.

4. **`commandRegistry.ts`**:
   - Central catalog mapping spoken phrases to 8 canonical `VoiceCommandId` tokens (`START_GAME`, `OPEN_GAMES`, `OPEN_ROUTINE`, `SHOW_REMINDERS`, `GO_HOME`, `REPEAT`, `HELP`, `GO_BACK`).
   - Supports both English phrases and Khasi phrases (the latter flagged for native speaker validation).

5. **`VoiceCommandService.ts`**:
   - Implements a three-tier matching pipeline:
     1. Exact phrase match (case-insensitive, normalized).
     2. Substring "contains" match.
     3. Levenshtein distance fuzzy match (tolerance $\le 3$) to accommodate slurred, slowed, or accented elderly speech.

6. **`VoiceService.ts`**:
   - Main singleton orchestrator (`getVoiceService()`).
   - Detects browser and OS voice capabilities (`VoiceCapabilities`).
   - Coordinates the voice state machine (`IDLE` $\rightarrow$ `LISTENING` $\rightarrow$ `PROCESSING` $\rightarrow$ `SUCCESS` / `ERROR` / `UNAVAILABLE`).
   - Dispatches parsed commands to registered application listeners.

7. **`index.ts`**:
   - Barrel export file exposing all voice types, providers, registries, and singleton accessors.

### New State Stores & Hooks

8. **`frontend/src/store/voiceStore.ts`**:
   - Zustand store tracking persistent user settings (`voiceEnabled`, `speechOutputEnabled`, `speechInputEnabled`, `speechRate`) and runtime session state (`voiceState`, `lastTranscript`, `lastCommand`, `lastError`, `capabilities`).

9. **`frontend/src/hooks/useVoice.ts`**:
   - Custom React hook abstracting speech recognition start/stop, text/key speech triggers, and automatic route navigation upon command execution.

### Overhauled & New UI Components

10. **`frontend/src/components/VoiceButton.tsx`**:
    - Accessible, large microphone button supporting 6 visual states (`IDLE`, `LISTENING`, `PROCESSING`, `SUCCESS`, `ERROR`, `UNAVAILABLE`).
    - Uses distinct colors, icons, text labels, ARIA live regions, and pulse animations so state is never conveyed by color alone.

11. **`frontend/src/pages/elderly/ElderlyAssistantPage.tsx`**:
    - Interactive voice assistant page featuring capability status banners, real-time transcript cards, error alert boxes, and high-contrast tactile navigation buttons as permanent fallbacks.

---

## 6. Technical Audit Assessment

The Phase 7 voice implementation successfully provides an elderly-accessible, failure-safe voice interface. It separates speech engine providers from application business logic, ensuring that local neural engines (such as Vosk, Sherpa-ONNX, or Piper TTS) can be swapped in as future offline enhancements without rewriting UI components or state stores.
