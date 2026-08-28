# Story Memory Game

## Purpose
Supports short-term memory, attention, comprehension, recall, sequencing, language engagement, emotional engagement, and culturally familiar memory activities.

## Implementation Details
- Uses the `AdaptiveCognitiveEngine`.
- Game ID: `story_memory`
- Three levels of difficulty mapping to the 1-10 difficulty scale:
  - Easy (Difficulty 1-3): Simple stories, 2 choices, unlimited read-alouds.
  - Medium (Difficulty 4-7): Moderate stories, 3 choices, 1 read-aloud allowed.
  - Hard (Difficulty 8-10): Complex stories, 4 choices, 0 read-alouds allowed.
- Uses voice hooks (`useGameVoice`) to read instructions, feedback, and the stories out loud to the patient.
- Uses `GameShell` for consistent UI and game management.
- Data structures are stored in `stories.ts` with localization keys for English and Khasi.
