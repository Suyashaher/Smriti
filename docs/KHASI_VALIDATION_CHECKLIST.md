# Khasi Localization Validation Checklist

**Project:** Smriti — Cognitive Gaming and Memory Assistance Platform  
**Target Locale:** Khasi (`kh` / `kha`) — Meghalaya, North Eastern India  
**Target Demographic:** Elderly dementia patients, family members, and caregivers  
**Purpose:** Comprehensive checklist for native Khasi speaker and linguistic consultant review prior to production deployment.

---

## Instructions for Reviewers

Please review each section in this checklist. Verify that the translations:
1. Are natural, accurate, and culturally appropriate in Khasi (*Ka Ktien Khasi*).
2. Use respectful, warm, and gentle phrasing suited for elderly individuals with cognitive decline.
3. Maintain correct orthography and diacritics (`ï`, `ñ`).
4. Avoid overly academic, archaic, or complex terminology where simple everyday spoken words are better understood.

---

## 1. General UI Terms

- [ ] **Navigation Labels:**
  - `Ïing` (Home), `Ki jingialang` (Games), `Jingïarap` (Help), `Ki jingpynsñiawthooh` (Settings), `Ki markah / Jingkylla` (Progress / Trends)
  - *Notes for Reviewer:* Check if navigation labels fit comfortably on mobile touch targets without text truncation.
- [ ] **Action & Common Controls:**
  - `Sdang` (Start), `La dep` (Done), `Phai shuh` (Back), `La kynmaw` (Next), `Hooid` (Yes), `Em` (No), `Pynïoh` (Save), `Pynïap` (Delete), `Pynbud` (Cancel), `Khang` (Close)
  - *Notes for Reviewer:* Verify if `Phai shuh` and `La kynmaw` clearly convey directional backward/forward navigation to seniors.
- [ ] **Time-of-Day Greetings & Mood Check-In:**
  - Morning / Afternoon / Evening greetings (*"Phi long kumno"*)
  - Mood check prompts: *"Kumno phi sngew mynta?"* (How are you feeling?) and response options: Good (😊), Okay (😐), Low (😟).
  - *Notes for Reviewer:* Verify that mood check-in terms are gentle, non-intimidating, and respectful.

---

## 2. Game Instructions (5 Cognitive Games)

- [ ] **Game 1: Memory Cards (`games.memoryCards`):**
  - Intro: *"You will see a few objects. Remember them. Then tap the ones you saw."*
  - Prompts: *"Look at these. Remember them."* / *"Tap the objects you saw."*
  - *Notes for Reviewer:* Check that instructions are concise and do not overload short-term memory.
- [ ] **Game 2: Object Recognition (`games.objectRecognition`):**
  - Intro: *"Look at the picture. Tap its name."*
  - Prompt: *"What is this?"*
  - *Notes for Reviewer:* Ensure the question prompt is familiar and colloquial.
- [ ] **Game 3: Pattern Recognition (`games.patternRecognition`):**
  - Intro: *"Look at the colors. Tap what comes next."*
  - Prompt: *"What comes next?"*
  - *Notes for Reviewer:* Confirm that sequence concepts (`Riti` / what comes next) are intuitive.
- [ ] **Game 4: Daily Routine Recall (`games.routineRecall`):**
  - Intro: *"Look at the daily steps. Tap what comes next."*
  - Prompt: *"What comes next in your day?"*
  - *Notes for Reviewer:* Verify routine sequence terminology matches daily Meghalaya lifestyle rhythms.
- [ ] **Game 5: Visual Attention / Fruit Search (`games.attention`):**
  - Intro: *"Find every fruit. Tap them, then press Done."*
  - Prompt: *"Find all the fruits."*
  - *Notes for Reviewer:* Ensure the distinction between fruits and non-fruits is clear and unambiguous.
- [ ] **Encouragement & Non-Punitive Feedback:**
  - Positive feedback: *"Well done"* (`La buh bha`), *"Great work!"*, *"Excellent"* (`Bha shibun`).
  - Retry feedback: *"Well done! Let's try again."*, *"That's okay. Let's try together."* (`Pyrkhat biang`).
  - Non-medical disclaimer: *"This is activity practice, not a medical result."*

---

## 3. Reminder Terminology

- [ ] **Headers & Prompts:**
  - Reminder Section: `Jingpynkynmaw` (Reminders), *"It's time for..."* (`La dei ka por ïa...`)
  - Empty state: *"No reminders yet."*
- [ ] **Reminder Action Controls:**
  - `Done` (Complete), `Skip` (Skip), `Remind me later` (Snooze 15 min)
  - *Notes for Reviewer:* Check if snooze / postpone phrasing feels friendly rather than demanding.
- [ ] **Reminder Categories & Event Types:**
  - `Dawai` (Medicine), `Um` (Drink Water), `Jingbuh` (Meal / Food), `Jingwoh` (Activity / Exercise), `Jingïashem` (Appointment).
  - Status indicators: `Scheduled`, `Completed`, `Skipped`, `Missed` (`La pep`).

---

## 4. Routine Terminology

- [ ] **Routine Navigation & Daily Timeline:**
  - Routine Title: `Jingïalade sngi` (Today's Routine / Daily Steps)
  - Empty State: *"No routine items yet. A caregiver can add them later."*
- [ ] **Routine Milestone Steps:**
  - `Thoh` / `Kie` (Wake Up)
  - `Jingbuh mynstep` (Breakfast)
  - `Dawai` (Morning / Evening Medicine)
  - `Jingwoh jingmut` (Cognitive Activity / Game)
  - `Jingbuh la sngi` (Lunch)
  - `Leit ïaid` (Afternoon Walk / Rest)

---

## 5. Caregiver Dashboard

- [ ] **Caregiver Navigation & Section Headers:**
  - `Caregiver dashboard`, `Patients`, `Activity trends`, `Game history`, `Reminder monitoring`, `Routine management`, `Settings`.
- [ ] **Metrics & Operational Labels:**
  - `Total patients`, `Active patients`, `Today's activities`, `Missed reminders`, `Alerts`.
  - `Activity score`, `Games played`, `Level / Difficulty`, `Sessions`.
  - Trend indicators: `Improving`, `Stable`, `Needs attention`, `Not enough data`.
- [ ] **Non-Clinical Disclaimers:**
  - *"Figures describe app activity only. They are not a medical assessment."*
  - *Notes for Reviewer:* Ensure the clinical disclaimer sounds professional and legally clear in Khasi.

---

## 6. Accessibility Text (Aria-Labels & Screen Readers)

- [ ] **Screen Reader Descriptions for Icon-Only Buttons:**
  - Delete buttons: `Pynïap ïa kane ka jingpynkynmaw` (Delete this reminder)
  - Reorder up/down buttons: `Kyntiew shajrong` (Move up) / `Pynhiar shapoh` (Move down)
  - Close / Dismiss modals: `Khang ïa ka kamra` (Close dialog)
  - Sound & Voice buttons: `Pynsñiaw sur` (Voice prompt)
- [ ] **Semantic High-Contrast Elements:**
  - Check that all aria tags describe the action accurately without relying on visual icon comprehension.

---

## 7. Notification Text

- [ ] **Browser / Desktop Push Notifications:**
  - Notification Title: `La dei ka por jingpynkynmaw!` (Reminder Time!)
  - Notification Body: `La dei ka por ban shim dawai / dih um.` (It is time for your scheduled reminder.)
- [ ] **In-App Toast Alerts & Banner Messages:**
  - Offline banner: `Phi don shabar internet. Ka app ka treikam pura ha kane ka kor.` (You are offline. Everything works locally.)
  - Storage saved confirmation: `La pynïoh ha kane ka kor.` (Saved on this device.)

---

## 8. Cultural Content (Objects, Fruits, and Regional Resonance)

- [ ] **Generic & Local Food / Fruit Items:**
  - `Ja` (Rice), `Sha` (Tea), `Soh apple` (Apple), `Soh kynthai` (Banana), `Soh niamtra` (Orange).
  - *Notes for Reviewer:* Are there regional fruits (e.g. `Sohphie`, `Sohiong`) that should be added in Khasi content packs?
- [ ] **Household & Utensil Items:**
  - `Ki kap` (Cup), `Kot` (Book), `Mau` (Chair), `Chamok` (Spoon), `Siar` (Bowl), `Klieh` (Key), `Jingïap bneng` / `Juti` (Shoe).
  - *Notes for Reviewer:* Check if traditional utensil names match everyday spoken Khasi across both rural and urban areas.

---

## 9. Error Messages & System Status

- [ ] **Storage & Offline Failures:**
  - Error Title: `Don ka jingbakla` (Something went wrong)
  - Error Retry: `Pyrshang biang` (Try again)
  - Storage Error: `Ym lah ban plie ïa ka database. Khang ïa kiwei ki tab bad plie biang.` (Could not open local storage.)
  - Unsaved Answers: `Ym lah pynïoh. Ki jubab jong phi ki dang sah hangne. Pyrshang biang.`

---

## 10. Spelling & Grammar Review

- [ ] **Diacritics & Letter Forms:**
  - Verify consistent usage of `ï` (e.g. `Ïing`, `Jingïarap`, `Pynïoh`) versus plain `i`.
  - Verify consistent usage of `ñ` (e.g. `Ki jingpynsñiawthooh`).
- [ ] **Word Division & Hyphenation:**
  - Ensure standard Khasi compound words follow modern orthographic conventions.

---

## 11. Elderly Comprehension Check

- [ ] **Simplicity & Cognitive Accessibility:**
  - Are sentences short, direct, and free of unnecessary subordinate clauses?
  - Are action verbs placed prominently?
  - Would a 75-year-old elder with mild-to-moderate cognitive impairment understand the buttons without needing translation from family members?

---

## 12. Terminology Consistency

- [ ] **Cross-Catalog Parity:**
  - Is the same Khasi term used for "Reminder" across the Home page, Modal, Caregiver dashboard, and Settings?
  - Is "Game" consistently translated as `Jingialang` throughout the application?
  - Is "Done" consistently translated as `La dep` across games, reminders, and routines?

---

## Validation Sign-Off Section

| Field | Reviewer Information |
| :--- | :--- |
| **Reviewer Full Name:** | __________________________________________________ |
| **Date of Review:** | __________________________________________________ |
| **Native Khasi Speaker:** | [ ] Yes &nbsp;&nbsp;&nbsp;&nbsp; [ ] No |
| **Region / Dialect (e.g., Shillong, Sohra, Bhoi, War):** | __________________________________________________ |
| **Overall Assessment:** | [ ] Approved without changes <br> [ ] Approved with minor edits <br> [ ] Requires revision |

### Detailed Reviewer Feedback & Linguistic Notes:

```text
[ Reviewer to write additional linguistic observations, dialectal considerations, or recommended alternative terms here ]
```
