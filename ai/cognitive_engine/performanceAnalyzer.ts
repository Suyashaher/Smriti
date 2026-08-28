import {
  DEFAULT_SCORE_WEIGHTS,
  RECENT_SESSION_MAX,
  RECENT_SESSION_MIN,
  RESPONSE_TIME_THRESHOLDS,
  type ActivityTrend,
  type GameId,
  type GameSessionInput,
  type PerformanceBreakdown,
  type ResponseBand,
  type ScoreWeights,
} from "./types";

export function clamp01(value: number): number {
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

export function takeRecentSessions(results: GameSessionInput[]): GameSessionInput[] {
  return [...results]
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    .slice(-RECENT_SESSION_MAX);
}

export function classifyResponseTime(gameId: GameId, responseTimeSeconds: number): ResponseBand {
  const thresholds = RESPONSE_TIME_THRESHOLDS[gameId];
  if (responseTimeSeconds <= thresholds.fastMaxSeconds) return "fast";
  if (responseTimeSeconds <= thresholds.normalMaxSeconds) return "normal";
  return "slow";
}

/**
 * Maps a response band to a 0–1 contribution. Must not dominate overall score.
 */
export function responseBandScore(band: ResponseBand): number {
  if (band === "fast") return 1;
  if (band === "normal") return 0.7;
  return 0.4;
}

export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/**
 * High consistency = similar accuracies. Not a medical finding.
 * Example: 0.90, 0.88, 0.92 → high; 0.95, 0.50, 0.90 → low.
 */
export function consistencyFromAccuracies(accuracies: number[]): number {
  if (accuracies.length < 2) return 0.5;
  const avg = mean(accuracies);
  const variance =
    accuracies.reduce((sum, value) => sum + (value - avg) ** 2, 0) / accuracies.length;
  const stdev = Math.sqrt(variance);
  return Math.round(clamp01(1 - stdev / 0.25) * 100) / 100;
}

export function isHighConsistency(consistency: number): boolean {
  return consistency >= 0.7;
}

export function cognitivePerformanceScore(parts: {
  meanAccuracy: number;
  completionRate: number;
  responsePerformance: number;
  consistency: number;
  weights?: ScoreWeights;
}): number {
  const weights = parts.weights ?? DEFAULT_SCORE_WEIGHTS;
  const raw =
    weights.accuracy * clamp01(parts.meanAccuracy) +
    weights.completion * clamp01(parts.completionRate) +
    weights.response * clamp01(parts.responsePerformance) +
    weights.consistency * clamp01(parts.consistency);
  return Math.round(clamp01(raw) * 100);
}

export function activityTrend(accuraciesChronological: number[]): ActivityTrend {
  if (accuraciesChronological.length < RECENT_SESSION_MIN) {
    return "insufficient_data";
  }
  const midpoint = Math.floor(accuraciesChronological.length / 2);
  const earlier = mean(accuraciesChronological.slice(0, midpoint));
  const later = mean(accuraciesChronological.slice(midpoint));
  const delta = later - earlier;
  if (delta >= 0.08) return "improving";
  if (delta <= -0.08) return "declining";
  return "stable";
}

export function analyzePerformance(
  gameId: GameId,
  recentResults: GameSessionInput[],
): PerformanceBreakdown {
  const windowed = takeRecentSessions(recentResults);
  const accuracies = windowed.map((row) => row.accuracy);
  const completionRate =
    windowed.length === 0
      ? 0
      : windowed.filter((row) => row.completed).length / windowed.length;
  const meanAccuracy = mean(accuracies);
  const meanResponse = mean(windowed.map((row) => row.responseTime));
  const responseBand = classifyResponseTime(gameId, meanResponse);
  const responsePerformance = responseBandScore(responseBand);
  const consistency = consistencyFromAccuracies(accuracies);

  return {
    meanAccuracy,
    completionRate,
    responsePerformance,
    consistency,
    cognitivePerformanceScore: cognitivePerformanceScore({
      meanAccuracy,
      completionRate,
      responsePerformance,
      consistency,
    }),
    responseBand,
    trend: activityTrend(accuracies),
    sessionCount: windowed.length,
  };
}

export function repeatedIncomplete(results: GameSessionInput[]): boolean {
  const windowed = takeRecentSessions(results);
  if (windowed.length < 2) return false;
  const incomplete = windowed.filter((row) => !row.completed).length;
  return incomplete >= 2;
}
