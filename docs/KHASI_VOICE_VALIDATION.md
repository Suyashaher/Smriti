# Khasi Voice Phrase Validation & Linguistic Protocol

**Project:** Smriti — AI-Based Cognitive Gaming and Memory Assistance Platform  
**Target Language:** Khasi (*Ka Ktien Khasi*)  
**ISO 639-3 Code:** `kha`  
**Target Region:** Meghalaya, North Eastern India  
**Target Demographic:** Elderly dementia patients, family caregivers, and community healthcare workers  
**Document Version:** 1.0.0  
**Status:** Best-Effort Preliminary Catalog (Awaiting Field Validation)  

---

## 1. Executive Summary & Purpose

This document catalogs all spoken command phrases and synthetic voice feedback phrases in the Khasi language (*Ka Ktien Khasi*) used within the Smriti platform.

Khasi is an Austroasiatic language spoken predominantly in the state of Meghalaya in North Eastern India. Because standard speech recognition engines and speech synthesis libraries currently lack native Khasi acoustic models, all phrases in this catalog represent **best-effort linguistic approximations** designed to establish a standardized lexical baseline.

This document serves as the formal review instrument for native Khasi linguists, native speaker healthcare workers, and community partners in Meghalaya to validate, refine, and sign off on spoken interactions prior to training or integrating custom Khasi Automatic Speech Recognition (ASR) and Text-to-Speech (TTS) models.

---

## 2. Technical Realities & Important Disclaimers

> [!IMPORTANT]
> **1. No Client-Side Khasi Speech Model Currently Exists:**  
> Neither the W3C Web Speech API (`SpeechRecognition` / `speechSynthesis`), nor standard offline neural engines (Vosk, Sherpa-ONNX, Piper TTS) currently provide off-the-shelf runnable models for Khasi (`kha`).
>
> **2. Prepared for Future Speech Model Integration:**  
> The phrases documented below are mapped into the Smriti `commandRegistry.ts` and i18n catalogs (`kh.json`) for future activation as soon as fine-tuned Khasi ASR models (such as MWire Labs North East ASR or Digital India Bhashini models) become available.
>
> **3. Best-Effort Initial Translations:**  
> All Khasi voice phrases in this document are initial approximations and **require thorough native speaker validation** before clinical or pilot deployment.
>
> **4. High-Contrast Touch Button Fallback:**  
> For Khasi-speaking users, the application guarantees 100% feature accessibility through large, tactile, high-contrast touch buttons across all screens. Voice interaction is strictly an optional layer.

---

## 3. Khasi Voice Command Phrases Table

The following spoken phrases are registered in `frontend/src/services/voice/commandRegistry.ts`. When speech recognition is active, the fuzzy matching engine compares spoken transcripts against these phrases to trigger application navigation:

| English Phrase | Khasi Phrase | Command ID | Confidence | Native Validation Required | Context / Target Action |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **start game** | *sdang jingialang* | `START_GAME` | **LOW** | **YES** | Spoken command to launch games from home or assistant |
| **open games** | *plie ki jingialang* | `OPEN_GAMES` | **LOW** | **YES** | Spoken command to navigate to the cognitive games menu (`/elderly/games`) |
| **daily routine** | *ka jingïalad* | `OPEN_ROUTINE` | **LOW** | **YES** | Spoken command to view today's timeline (`/elderly/routine`) |
| **show reminders** | *ki jingpynkynmaw* | `SHOW_REMINDERS` | **MEDIUM** | **YES** | Spoken command to view scheduled reminders (`/elderly/reminders`) |
| **go home** | *sha ïing* | `GO_HOME` | **MEDIUM** | **YES** | Spoken command to return to the elderly home screen (`/elderly`) |
| **repeat** | *ong biang* | `REPEAT` | **LOW** | **YES** | Spoken command to repeat the last spoken instruction or clue |
| **help me** | *ïarap ia nga* | `HELP` | **LOW** | **YES** | Spoken command to navigate to the help screen (`/elderly/help`) |
| **go back** | *phai shuh* | `GO_BACK` | **MEDIUM** | **YES** | Spoken command to navigate back to the previous screen (`window.history.back()`) |

### Command Synonyms & Variations for Field Testing

The `commandRegistry.ts` also registers colloquial shortened phrases to accommodate elderly speech economy:

```typescript
kh: [
  { commandId: "START_GAME",     phrases: ["sdang jingialang", "sdang", "ialang"] },
  { commandId: "OPEN_GAMES",     phrases: ["plie ki jingialang", "ki jingialang"] },
  { commandId: "OPEN_ROUTINE",   phrases: ["ka jingïalad", "mynta", "jingïalad sngi"] },
  { commandId: "SHOW_REMINDERS", phrases: ["ki jingpynkynmaw", "pynkynmaw"] },
  { commandId: "GO_HOME",        phrases: ["ïing", "sha ïing", "phai sha ïing"] },
  { commandId: "REPEAT",         phrases: ["ong biang", "biang", "aiu"] },
  { commandId: "HELP",           phrases: ["jingïarap", "ïarap", "ïarap ia nga"] },
  { commandId: "GO_BACK",        phrases: ["phai shuh", "shuh"] },
]
```

---

## 4. Khasi Voice Feedback & Prompt Phrases Table

These spoken audio prompts provide reassurance, guidance, and alert notifications during gameplay and daily routines:

| English Prompt | Khasi Phrase | Usage Category | Validation Required | Trigger & Context |
| :--- | :--- | :--- | :---: | :--- |
| **Good morning** | *Phi long kumno* | Greeting | **YES** | Spoken on morning home screen or assistant launch (< 12:00) |
| **Well done** | *La buh bha* | Game Feedback | **YES** | Spoken upon successful completion of a game round |
| **Let's try again** | *Pyrkhat biang* | Game Retry | **YES** | Gentle, non-punitive spoken reinforcement on incorrect attempt |
| **It's medicine time** | *Ka la wan ka por na dawai* | Reminder Alert | **YES** | Spoken alert when a scheduled medication reminder triggers |
| **Please drink water** | *Dih um* | Reminder Alert | **YES** | Spoken alert when a scheduled hydration reminder triggers |
| **Good afternoon** | *Phi long kumno, ka por la sngi* | Greeting | **YES** | Midday greeting prompt (12:00–17:00) |
| **Good evening** | *Phi long kumno, ka jingman* | Greeting | **YES** | Evening greeting prompt ($\ge$ 17:00) |
| **Great work!** | *Ka jingwoh ka bha!* | Commendation | **YES** | Spoken after high-accuracy cognitive gameplay |
| **That's okay. Let's try together.** | *Thoh thoh. Ai i pyrkhat ia waroh.* | Reassurance | **YES** | Empathetic reassurance when an elder pauses or hesitates |
| **It is meal time.** | *Ka la wan ka por na jingbuh.* | Reminder Alert | **YES** | Spoken alert for breakfast, lunch, or dinner |

---

## 5. Linguistic & Dialectal Guidance for Native Validators

When reviewing and verifying Khasi voice phrases for elderly individuals experiencing cognitive impairment, reviewers should observe the following linguistic principles:

### 1. Dialectal Baseline & Inclusivity
- **Standard Khasi (Sohra / Cherrapunji dialect):** Serves as the literary and educational benchmark.
- **Urban & Rural Variations (Shillong, Bhoi, War, Pnar/Jaintia):** Spoken phrases must avoid highly localized idioms that may confuse seniors originating from different regions of the Khasi and Jaintia Hills.
- **Colloquial Register:** Phrases should sound like a caring family member speaking at home, rather than a formal broadcast or textbook reading.

### 2. Orthography & Diacritic Integrity
- The Khasi Latin alphabet features distinct vowel characters that must be strictly preserved:
  - **`ï` (with diaeresis / trema):** Represents a distinct palatal vocalic sound (e.g., *ïing*, *jingïarap*, *pynïoh*).
  - **`ñ` (with tilde):** Represents the palatal nasal (e.g., *pynsñiawthooh*).
- System files must maintain UTF-8 encoding without BOM to prevent corruption in JSON catalogs.

### 3. Acoustic Clarity for Acoustic Modeling
- Short, phonetically distinct phrases (e.g., *sha ïing*, *sdang*) are preferable for acoustic recognizers over lengthy multi-clause sentences.
- Avoid consonant clusters that are prone to slurring among elderly speakers suffering from motor speech deficits (dysarthria).

---

## 6. Native Speaker Validation Sign-Off Protocol

To certify this Khasi voice vocabulary for future speech engine training and pilot deployment, please complete the verification protocol below:

### Reviewer Details

| Attribute | Field Data |
| :--- | :--- |
| **Full Name of Reviewer:** | __________________________________________________ |
| **Title / Role (e.g., Linguist, Community Elder, Healthcare Worker):** | __________________________________________________ |
| **Organization / Institution:** | __________________________________________________ |
| **Native Khasi Speaker:** | [ ] Yes &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [ ] No |
| **Home District / Sub-Dialect:** | __________________________________________________ |
| **Review Date:** | __________________________________________________ |

### Evaluation Criteria

- [ ] **Acoustic Intelligibility:** Spoken phrases are easy to enunciate and distinct from one another.
- [ ] **Elderly Appropriateness:** Tone is respectful (*akor*), warm, and free of patronizing language.
- [ ] **Cultural Resonance:** Terminology matches daily home living in Meghalaya (e.g., *Dih um*, *Dawai*, *Jingbuh*).
- [ ] **Diacritic Accuracy:** `ï` and `ñ` characters are correctly applied throughout.

### Validation Decision

- [ ] **APPROVED WITHOUT MODIFICATION** — All phrases are approved for speech model training and registry use.
- [ ] **APPROVED WITH MINOR AMENDMENTS** — Changes noted in comments below.
- [ ] **REVISE AND RESUBMIT** — Substantial dialectal or tonal revisions required.

### Reviewer Signature & Field Notes:

```text
Linguistic Observations & Recommended Phrase Substitutions:
____________________________________________________________________________________
____________________________________________________________________________________
____________________________________________________________________________________
____________________________________________________________________________________

Signature: _________________________________________    Date: ______________________
```
