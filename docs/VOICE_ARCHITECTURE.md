# Smriti — Voice & Speech Architecture Documentation

**Document Version:** 1.0.0  
**Project:** Smriti — AI-Based Cognitive Gaming and Memory Assistance Platform  
**Target Region:** North Eastern India (Meghalaya focus)  
**Target Audience:** Elderly dementia patients, family caregivers, and healthcare workers  
**Last Updated:** 2026-08-27  

---

## 1. Overview

The voice and speech subsystem of Smriti provides hands-free spoken interaction, audio guidance, and vocal affirmations designed specifically for elderly individuals experiencing mild-to-moderate cognitive impairment and dementia.

Recognizing the technical, linguistic, and connectivity challenges of North Eastern India, Smriti implements a **provider-independent voice abstraction layer**. This layer decouples the application UI and game logic from the underlying speech engine, enabling the platform to run immediately with browser built-in APIs while remaining architected for drop-in offline neural speech models (such as Vosk, Sherpa-ONNX, and Piper TTS) in future releases.

### Key Architectural Principles
- **Provider-Independent Abstraction:** All voice operations pass through a formal `VoiceProvider` interface. The React frontend never invokes browser speech primitives directly.
- **Fail-Safe & Non-Blocking:** Voice is strictly an enhancement. Any failure in speech synthesis or recognition fails silently and safely, never halting gameplay, timers, or navigation.
- **Honest Capability Accounting:** Clear, transparent distinction between genuinely offline features (local OS TTS) and connectivity-dependent features (browser STT).
- **Elderly-First Ergonomics:** Slower default speech rate (0.85x), acoustic chime alerts, high-contrast visual indicators with 6 distinct states, and fault-tolerant fuzzy command recognition (Levenshtein distance $\le 3$).
- **Touch Fallback Guarantee:** Every voice action is mirrored by high-contrast, large tactile touch buttons on every screen.

---

## 2. Architecture Diagram

The diagram below illustrates the end-to-end voice processing pipeline, from user interaction in React components down to native speech hardware:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           React UI Layer                                │
│   ┌────────────────────────┐  ┌──────────────────────────────────────┐  │
│   │ ElderlyAssistantPage   │  │ VoiceButton Component                │  │
│   │ ActiveReminderModal    │  │ (IDLE, LISTENING, PROCESSING,        │  │
│   │ Cognitive Game Screens │  │  SUCCESS, ERROR, UNAVAILABLE)        │  │
│   └───────────┬────────────┘  └──────────────────▲───────────────────┘  │
└───────────────┼──────────────────────────────────┼──────────────────────┘
                │                                  │
                ▼                                  │
┌──────────────────────────────────────────────────┴──────────────────────┐
│                    useVoice Hook (src/hooks/useVoice.ts)                │
│  - Reactive UI state bindings                                           │
│  - Command navigation auto-dispatch                                     │
│  - Unified startListening(), stopListening(), speak(), speakText()      │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│               VoiceService Orchestrator (src/services/voice/)           │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ VoiceState Machine & Capability Introspection                     │  │
│  │ (speechRecognition, speechSynthesis, englishTTS, khasiTTS, etc.)  │  │
│  └──────────────────┬─────────────────────────────────┬──────────────┘  │
│                     │                                 │                 │
│                     ▼                                 ▼                 │
│  ┌─────────────────────────────────────┐  ┌──────────────────────────┐  │
│  │ VoiceCommandService                 │  │ SpeechSynthesisService   │  │
│  │ - Exact Phrase Match                │  │ - i18n Key Translation   │  │
│  │ - Substring "Contains" Match        │  │ - Elderly Rate (0.85x)   │  │
│  │ - Levenshtein Distance (<= 3)       │  │ - Utterance Queue Guard  │  │
│  │ - commandRegistry (en / kh)         │  │                          │  │
│  └──────────────────┬──────────────────┘  └───────────┬──────────────┘  │
└─────────────────────┼─────────────────────────────────┼─────────────────┘
                      │                                 │
                      ▼                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    VoiceProvider Interface (types.ts)                   │
│  isAvailable(), startListening(), stopListening(), speak(), stop()      │
└──────────────────────────────────┬──────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│         BrowserVoiceProvider (src/services/voice/BrowserVoiceProvider)  │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────┐  │
│  │ Web Speech Recognition API       │  │ Web Speech Synthesis API    │  │
│  │ (SpeechRecognition)              │  │ (speechSynthesis)           │  │
│  │ - Language: en-US, en-IN         │  │ - OS-Installed Voices       │  │
│  │ - Cloud-Dependent in Chrome/Edge │  │ - Genuinely Offline         │  │
│  └──────────────────┬───────────────┘  └──────────────┬──────────────┘  │
└─────────────────────┼─────────────────────────────────┼─────────────────┘
                      │                                 │
                      ▼                                 ▼
               [ Microphone ]                     [ Speakers ]
```

---

## 3. Speech-to-Text (STT) Technology

### Implementation Details
- Speech recognition is implemented in `BrowserVoiceProvider.ts` using the W3C Web Speech API standard:
  ```ts
  const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
  ```
- Speech sessions are configured for single-utterance command capture:
  - `continuous = false`
  - `interimResults = true` (to provide live visual feedback while speaking)
  - `maxAlternatives = 1`

### Connectivity Dependency & Honest Labeling
> [!WARNING]
> **Cloud-Dependent STT in Chromium:** In Google Chrome, Microsoft Edge, and Android WebView, `SpeechRecognition` streams captured microphone audio to remote cloud endpoints (Google/Microsoft speech servers) for acoustic modeling and language processing.

- **Offline Behavior:** When an internet connection is unavailable, `SpeechRecognition` will emit an error event with code `"network"`. The Smriti voice store captures this and renders an informative alert: *"Speech recognition requires an internet connection."*
- **Language Coverage:**
  - **English (`en-US`, `en-IN`, `en-GB`):** Fully supported by standard browser speech engines.
  - **Khasi (`kha`):** **NOT supported** by the Web Speech API in any commercial browser. No browser speech recognition engine currently offers an ASR model for Khasi.

---

## 4. Text-to-Speech (TTS) Technology

### Implementation Details
- Speech synthesis is implemented via the W3C Web Speech API `window.speechSynthesis` and `SpeechSynthesisUtterance`.
- The high-level `SpeechSynthesisService` handles:
  - Translating dot-notation i18n keys to spoken localized strings before utterance creation.
  - Applying elderly-tuned prosody: default speed rate is lowered to **0.85x** (range 0.3x–2.0x) with pitch normalized at 1.0.
  - Explicit utterance queue management via `speechSynthesis.cancel()` prior to new speech calls to prevent overlapping or stale announcements.

### Genuinely Offline Speech Output
> [!NOTE]
> **Offline Operation:** Unlike STT, TTS operates **completely offline** when utilizing locally installed operating system voices.

- **Local Voice Introspection:** At startup, `BrowserVoiceProvider` queries `speechSynthesis.getVoices()` (and listens to `onvoiceschanged`) to identify voices where `localService === true`:
  - **Windows:** SAPI5 and OneCore local system voices (e.g., Microsoft David, Microsoft Zira, Microsoft Ravi).
  - **Android:** Google TTS on-device downloaded speech data.
  - **macOS / iOS:** Apple `AVSpeechSynthesizer` compact and enhanced local voices (e.g., Samantha, Daniel).
  - **Linux:** Local `speech-dispatcher` or `espeak-ng` backends.
- **Language Coverage:**
  - **English:** Supported offline across all major platforms.
  - **Khasi:** **NOT supported**. No synthetic Khasi voice exists in standard OS speech libraries. If the active locale is Khasi, the assistant informs the user via UI text and falls back to visual rendering.

---

## 5. Offline Capabilities & Future Offline STT

| Speech Feature | Current Browser Web Speech Implementation | Future On-Device Neural Engine |
| :--- | :--- | :--- |
| **TTS (English)** | **YES (Offline)** — uses OS local voice service | **YES (Offline)** — Piper TTS WASM (~16MB) |
| **TTS (Khasi)** | **NO** — no OS voice exists | **NO** (requires training custom Khasi Piper model) |
| **STT (English)** | **NO (Cloud-dependent)** — requires browser servers | **YES (Offline)** — Vosk WASM (~40MB) or Sherpa-ONNX (~25MB) |
| **STT (Khasi)** | **NO** — no browser engine exists | **Future Hybrid** — Server ASR (Bhashini / MWire Labs) |

Smriti's `VoiceProvider` interface was engineered to permit a seamless swap from `BrowserVoiceProvider` to a local WASM provider (`VoskVoiceProvider` or `SherpaVoiceProvider`) without modifying any application components.

---

## 6. Hardware & System Requirements

### Hardware Requirements
- **Microphone:** Any standard internal microphone, USB microphone, or 3.5mm headset.
- **Audio Output:** Device speakers, internal tablet speaker, or 3.5mm/Bluetooth headphones.
- **Compute / Memory:** Zero additional CPU/RAM overhead for the baseline Web Speech API implementation, as processing is handled by browser native binaries or operating system daemons.

### Software & Operating System
- **Supported Browsers:** Google Chrome ($\ge 90$), Microsoft Edge ($\ge 90$), Mozilla Firefox ($\ge 100$, TTS only), Safari ($\ge 14.1$).
- **Supported Operating Systems:** Windows 10/11, Android 8.0+, macOS 11+, iOS 14.5+, Linux (with PulseAudio/PipeWire and speech-dispatcher).

---

## 7. Model Sizes and Download Footprint

- **Current Implementation:** **0 KB** additional model download. The application bundle introduces zero external binary weight because it interfaces directly with browser and OS primitives.
- **Future Offline Model Integrations:**
  - **Vosk English Small Model (`vosk-model-small-en-us-0.15`):** ~40 MB compressed.
  - **Sherpa-ONNX Zipformer INT8 Model:** ~25 MB – 45 MB compressed.
  - **Piper TTS English Voice (`en_US-lessac-medium`):** ~16 MB.

---

## 8. Privacy & Data Handling

Smriti was built with stringent data privacy standards tailored for healthcare and memory assistance applications:

1. **Zero Audio Recording or Persistence:**
   - Smriti application code **never records, saves, compresses, or stores** raw audio streams or PCM audio chunks.
   - Audio captured by the microphone is processed directly by the browser runtime and immediately discarded after transcript generation.
2. **Zero Database Audio Storage:**
   - No audio data or transcripts are persisted in IndexedDB (Dexie) or synced to MongoDB.
   - Transcripts exist ephemerally in volatile memory (`useVoiceStore.lastTranscript`) only for the duration required to evaluate voice commands.
3. **Browser Vendor Data Disclosures:**
   - When using Chrome or Edge on online devices, audio buffers are transmitted over encrypted TLS connections to Google or Microsoft speech recognition endpoints. This operational reality is disclosed in the application settings and privacy documentation.
4. **Local TTS Isolation:**
   - Speech synthesis runs entirely on the host CPU. No synthesized text strings leave the client device during TTS execution.

---

## 9. Fallback Behavior & Accessibility Guarantees

In dementia care environments, speech recognition can fail due to dysarthria, tremors, background noise, or network dropouts. Smriti ensures that **voice is never a single point of failure**:

```
                              Voice Input Triggered
                                       │
                    ┌──────────────────┴──────────────────┐
                    ▼                                     ▼
        Speech Recognized & Matched              Recognition Fails / Offline
                    │                                     │
                    ▼                                     ▼
        Execute Command Action                  Render Visual Feedback &
        (e.g., Navigate to /games)              Highlight Large Touch Buttons
```

1. **Touch-First UI Parity:** Every voice command has an identical, high-contrast, large-touch button counterpart.
2. **Visual Status Indicators:** The `VoiceButton` component provides continuous visual feedback across 6 distinct states:
   - **`IDLE`:** Solid elder-primary background, `<Mic />` icon, *"Tap to speak"* label.
   - **`LISTENING`:** Vibrant green background, pulsing animation ring, `<Mic />` icon, *"Listening…"* label.
   - **`PROCESSING`:** Warm amber background, spinning loader icon (`<Loader2 />`), *"Processing…"* label.
   - **`SUCCESS`:** Calming green background, `<CheckCircle />` icon, *"Understood!"* label.
   - **`ERROR`:** Red background, `<AlertCircle />` icon, *"Tap to try again"* label, accompanied by error text.
   - **`UNAVAILABLE`:** Muted gray background, `<MicOff />` icon, *"Voice unavailable"* label, disabled button.
3. **TTS Graceful Degradation:** If TTS fails or is disabled, reminder chimes from `audioService.ts` still ring, and full-screen visual modal alerts (`ActiveReminderModal.tsx`) display.

---

## 10. Voice Commands & Natural Language Matching

Smriti provides 8 standardized voice commands that map directly to key application features:

### Supported Voice Commands

| Command ID | English Phrases | Khasi Phrases *(Pending Validation)* | Target Action |
| :--- | :--- | :--- | :--- |
| **`START_GAME`** | `"start game"`, `"play game"`, `"start"`, `"play"` | `"sdang jingialang"`, `"sdang"`, `"ialang"` | Navigates to `/elderly/games` |
| **`OPEN_GAMES`** | `"open games"`, `"games"`, `"show games"`, `"go to games"` | `"plie ki jingialang"`, `"ki jingialang"` | Navigates to `/elderly/games` |
| **`OPEN_ROUTINE`** | `"open routine"`, `"routine"`, `"today"`, `"daily routine"`, `"show routine"` | `"ka jingïalad"`, `"mynta"`, `"jingïalad sngi"` | Navigates to `/elderly/routine` |
| **`SHOW_REMINDERS`** | `"show reminders"`, `"reminders"`, `"open reminders"`, `"my reminders"` | `"ki jingpynkynmaw"`, `"pynkynmaw"` | Navigates to `/elderly/reminders` |
| **`GO_HOME`** | `"go home"`, `"home"`, `"main"`, `"go to home"` | `"ïing"`, `"sha ïing"`, `"phai sha ïing"` | Navigates to `/elderly` |
| **`REPEAT`** | `"repeat"`, `"say again"`, `"what"`, `"again"` | `"ong biang"`, `"biang"`, `"aiu"` | Repeats last spoken prompt |
| **`HELP`** | `"help"`, `"help me"`, `"i need help"` | `"jingïarap"`, `"ïarap"`, `"ïarap ia nga"` | Navigates to `/elderly/help` |
| **`GO_BACK`** | `"go back"`, `"back"`, `"previous"` | `"phai shuh"`, `"shuh"` | Navigates to previous screen (`history.back()`) |

### Three-Tier Matching Engine (`VoiceCommandService.ts`)

To ensure robust command recognition for elderly patients who may exhibit slurred, halting, or imprecise speech, the `VoiceCommandService` executes a multi-tiered matching pipeline:

1. **Tier 1: Exact Match (Confidence = 1.0)**
   - Normalizes input string (lowercased, trimmed). Compares directly against registry phrases.
2. **Tier 2: Substring "Contains" Match (Confidence = 0.85)**
   - Checks if the spoken transcript contains any valid command phrase as a substring (e.g., *"Can you please show reminders now"* contains *"show reminders"*).
3. **Tier 3: Fuzzy Levenshtein Distance Match (Confidence = $1.0 - \frac{\text{distance}}{\text{maxLen}}$)**
   - Computes dynamic programming edit distance between transcript and command phrases.
   - Matches are accepted if $\text{distance} \le 3$.
   - Commands require a minimum aggregate confidence threshold of **0.60** to trigger execution.

---

## 11. Browser Compatibility Matrix

| Browser | Platform | Speech-to-Text (STT) | Text-to-Speech (TTS) | Offline STT | Offline TTS | Notes |
| :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **Google Chrome** | Windows / Android / macOS | **Full** | **Full** | No | **Yes** | Recommended browser for full voice support. |
| **Microsoft Edge** | Windows / Android / macOS | **Full** | **Full** | No | **Yes** | Full feature parity with Chrome. |
| **Mozilla Firefox** | Windows / Linux / macOS | **Flag Only** | **Full** | No | **Yes** | STT disabled by default (requires setting `media.webspeech.recognition.enable` in `about:config`). TTS works out-of-the-box. |
| **Apple Safari** | macOS / iOS / iPadOS | **Partial** | **Full** | No | **Yes** | Web Speech STT supported on recent versions; requires explicit user touch gesture before audio playback. |
| **PWA (Installed)** | Android Chrome / Windows Edge | **Full** | **Full** | No | **Yes** | Full functionality when launched from home screen. |

---

## 12. Future Model Integration Guide

The Smriti voice engine is deliberately architected for drop-in extensions. Developers can implement genuine offline STT/TTS or specialized North Eastern language models by implementing the `VoiceProvider` interface.

### Step 1: Implement the `VoiceProvider` Interface
Create a new provider class adhering to `src/services/voice/types.ts`:

```ts
import type { VoiceProvider, STTResult, TTSOptions, VoiceInfo } from "./types";
import type { VoiceState } from "@/types";

export class VoskVoiceProvider implements VoiceProvider {
  readonly name = "Vosk Offline WebAssembly Engine";
  readonly connectivityDependent = false; // Genuinely offline!

  onResult: ((result: STTResult) => void) | null = null;
  onError: ((error: string) => void) | null = null;
  onStateChange: ((state: VoiceState) => void) | null = null;

  isAvailable(): boolean { return true; }
  supportsSpeechToText(): boolean { return true; }
  supportsTextToSpeech(): boolean { return false; }
  getSupportedSTTLanguages(): string[] { return ["en-US"]; }
  getSupportedTTSLanguages(): string[] { return []; }
  getAvailableVoices(): VoiceInfo[] { return []; }

  startListening(lang: string): void {
    // 1. Initialize AudioWorklet / Web Worker
    // 2. Stream 16kHz mono PCM buffers to Vosk WASM recognizer
    // 3. Emit onResult with transcripts
  }

  stopListening(): void {
    // Teardown AudioContext stream
  }

  async speak(text: string, options: TTSOptions): Promise<void> {}
  stopSpeaking(): void {}
  isSpeaking(): boolean { return false; }
}
```

### Step 2: Register the Provider in `VoiceService`
In `src/services/voice/VoiceService.ts`:
```ts
// Instantiate custom provider or dynamic selector based on connectivity
const provider = navigator.onLine ? new BrowserVoiceProvider() : new VoskVoiceProvider();
const voiceService = new VoiceService(provider);
```

### Candidate Offline & Regional Technologies

1. **Vosk Browser (`vosk-browser` via WebAssembly / Web Workers):**
   - **Footprint:** ~40 MB (`vosk-model-small-en-us-0.15`).
   - **Advantages:** Runs entirely inside client browser workers; 100% offline speech recognition; zero data leakage.
2. **Sherpa-ONNX (Next-gen Kaldi WebAssembly):**
   - **Footprint:** ~25 MB – 45 MB.
   - **Advantages:** High accuracy streaming Zipformer models running on WebAssembly + SIMD.
3. **Piper TTS WASM:**
   - **Footprint:** ~16 MB per ONNX voice checkpoint.
   - **Advantages:** High naturalness local neural text-to-speech without cloud calls.
4. **Khasi Regional Language Roadmaps:**
   - **Current State:** No client-side runnable WebAssembly model exists for Khasi ASR or TTS.
   - **Server-Assisted Options for Future Hybrid Releases:**
     - **Digital India Bhashini API:** Government of India initiative developing automated speech recognition and translation models for scheduled and tribal languages.
     - **MWire Labs North East ASR:** Fine-tuned Whisper models on regional North Eastern speech corpora.
