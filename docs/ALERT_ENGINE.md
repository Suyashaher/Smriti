# Alert Engine

The Smriti Alert Engine (`backend/app/services/alert_engine.py`) is responsible for generating notifications for caregivers based on heuristic evaluation of patient data.

## Alert Types & Severities
- `INFO`: Neutral observations (e.g., "Patient completed a difficult activity").
- `WARNING`: Minor concerns (e.g., "Several reminders missed today").
- `ACTION_REQUIRED`: Major concerns (e.g., "Significant drop in activity over 3 days").

**CRITICAL:** Alerts never use clinical diagnostic terms. 

## False-Alert Prevention
To prevent alert fatigue, the engine enforces strict thresholds:
- **Missed Reminders:** A single missed reminder will not trigger an alert. The default threshold is 3 missed reminders within a 24-hour period.
- **Inactivity:** A single day of inactivity will not trigger an alert. The default threshold is 48 hours.
- **Performance Drop:** A single bad game score is ignored. A drop must be sustained across at least 5 consecutive sessions to trigger an `ACTION_REQUIRED` alert.

## Acknowledgement
Caregivers can acknowledge alerts. Once acknowledged, the alert is hidden from the main view but preserved in the database history.
