# Analytics Methodology

The Smriti analytics engine runs exclusively on the backend via the `AnalyticsService` (`backend/app/services/analytics_service.py`). It aggregates raw data from MongoDB into meaningful metrics for caregivers.

## Performance Scoring
Game performance is calculated based on:
- **Score:** The raw points earned in a game.
- **Accuracy:** The percentage of correct actions vs total actions (0.0 to 1.0).
- **Difficulty:** The level of the game (1-10).

The `cognitivePerformanceScore` normalizes these factors to provide a steady metric that accounts for the adaptive difficulty engine (Phase 4).

## Trend Calculation
Trends are calculated by comparing recent performance against a historical baseline.
1. **Baseline:** The average score over the previous valid period (e.g., days 6-30).
2. **Recent:** The average score over the current period (e.g., days 1-5).
3. **Delta:** If the recent score is >10% lower than the baseline, the trend is marked as `DECREASING`. If >10% higher, `INCREASING`. Otherwise, `STABLE`.

## Adherence Metrics
- **Reminders:** Calculated as `(Completed Events / Scheduled Events) * 100`. Missed and Skipped events are separated in the raw data but both count against adherence.
- **Routines:** Calculated as `(Completed Tasks / Total Tasks) * 100`.

## Performance Optimization
To prevent heavy calculations on every page load, the frontend caches the analytics payload. By default, the analytics service aggregates data over the last 30 days.
