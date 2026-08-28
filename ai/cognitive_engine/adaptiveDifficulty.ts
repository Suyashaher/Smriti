import {
  activityTrend,
  analyzePerformance,
  isHighConsistency,
  repeatedIncomplete,
  takeRecentSessions,
} from "./performanceAnalyzer";
import {
  DEFAULT_DIFFICULTY,
  MAX_DIFFICULTY,
  MIN_DIFFICULTY,
  RECENT_SESSION_MIN,
  type AdaptiveInput,
  type AdaptiveOutput,
  type PatientRecommendation,
} from "./types";

export interface AdaptiveDifficultyEngine {
  recommend(input: AdaptiveInput): AdaptiveOutput;
}

export function clampDifficulty(value: number): number {
  const rounded = Math.round(value);
  if (rounded < MIN_DIFFICULTY) return MIN_DIFFICULTY;
  if (rounded > MAX_DIFFICULTY) return MAX_DIFFICULTY;
  return rounded;
}

function recommendationFor(
  next: number,
  current: number,
  meanAccuracy: number,
  sessionCount: number,
): PatientRecommendation {
  if (sessionCount < RECENT_SESSION_MIN) return "great_work";
  if (next > current) return "ready_challenge";
  if (next < current || meanAccuracy < 0.6) return "reassure";
  if (meanAccuracy >= 0.85) return "great_work";
  return "well_done_retry";
}

/**
 * Rule-based engine. Replace this class with an ML adapter later
 * without changing game UI (same AdaptiveDifficultyEngine interface).
 */
export class RuleBasedAdaptiveEngine implements AdaptiveDifficultyEngine {
  recommend(input: AdaptiveInput): AdaptiveOutput {
    const current = clampDifficulty(input.currentDifficulty || DEFAULT_DIFFICULTY);
    const windowed = takeRecentSessions(
      input.recentResults.filter((row) => row.gameId === input.gameId),
    );
    const analysis = analyzePerformance(input.gameId, windowed);

    if (windowed.length < RECENT_SESSION_MIN) {
      return {
        nextDifficulty: current,
        recommendation: recommendationFor(current, current, analysis.meanAccuracy, windowed.length),
        confidence: Math.round((0.25 + 0.1 * windowed.length) * 100) / 100,
        reason:
          "Fewer than 3 sessions for this activity. Difficulty stays the same until there is enough history.",
      };
    }

    const high =
      analysis.meanAccuracy >= 0.85 &&
      analysis.completionRate === 1 &&
      isHighConsistency(analysis.consistency);

    const low = analysis.meanAccuracy < 0.6 || repeatedIncomplete(windowed);

    let next = current;
    let reason: string;

    if (high) {
      next = clampDifficulty(current + 1);
      reason =
        next > current
          ? "Recent activity accuracy is high, sessions were completed, and results are consistent. Increase difficulty by 1."
          : "Recent activity accuracy is high and consistent. Difficulty is already at the maximum.";
    } else if (low) {
      next = clampDifficulty(current - 1);
      reason =
        next < current
          ? "Recent activity accuracy is low, or several sessions were not completed. Decrease difficulty by 1."
          : "Recent activity accuracy is low. Difficulty is already at the minimum.";
    } else {
      next = current;
      reason = "Recent activity accuracy is in the middle range. Keep the same difficulty.";
    }

    const trend = activityTrend(windowed.map((row) => row.accuracy));
    const confidence =
      Math.round(
        Math.min(0.95, 0.55 + 0.08 * windowed.length + 0.15 * analysis.consistency) * 100,
      ) / 100;

    return {
      nextDifficulty: next,
      recommendation: recommendationFor(next, current, analysis.meanAccuracy, windowed.length),
      confidence,
      reason: `${reason} Activity trend: ${trend}.`,
    };
  }
}

export const defaultAdaptiveEngine: AdaptiveDifficultyEngine = new RuleBasedAdaptiveEngine();

export function recommendDifficulty(
  input: AdaptiveInput,
  engine: AdaptiveDifficultyEngine = defaultAdaptiveEngine,
): AdaptiveOutput {
  return engine.recommend(input);
}
