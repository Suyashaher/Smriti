# Adaptive cognitive engine

Rule-based, offline difficulty and activity-performance analysis.

- No LLM per game
- No network
- Games keep independent difficulty (1 easy, 2 medium, 3 hard)
- **Cognitive Performance Score** is activity-only (0–100), not a medical score

Replace `RuleBasedAdaptiveEngine` with an ML adapter later by implementing `AdaptiveDifficultyEngine`.
