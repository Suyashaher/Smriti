# Family Bonding Game

## Purpose
Helps patients recognize and remember family members, strengthening emotional connections and exercising memory recall through familiar faces.

## Implementation Details
- Uses the `AdaptiveCognitiveEngine`.
- Game ID: `family_bonding`
- Caregiver side:
  - Caregivers manage family members on the `CaregiverFamilyPage`.
  - Photos are uploaded and stored on the backend, but synced to a local offline Dexie database (`familyPhotos`) on the frontend.
  - Requires at least 3 active family members to play.
- Patient side:
  - Game queries active family members from the local Dexie store.
  - If < 3 members exist, it shows a message asking to add more members.
  - Gameplay consists of identifying the name and relationship of the person in the photo.
- Difficulty Scaling (1-10):
  - Easy (Difficulty 1-3): 2 rounds, 2 choices for name/relationship.
  - Medium (Difficulty 4-7): 3 rounds, 3 choices.
  - Hard (Difficulty 8-10): 4 rounds, 4 choices.
- Uses voice hooks (`useGameVoice`) for reading instructions and giving feedback.
- Uses `GameShell` for consistent UI and game management.
