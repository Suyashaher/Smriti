export type DifficultyLevel = 1 | 2 | 3;

export const MIN_DIFFICULTY = 1;
export const MAX_DIFFICULTY = 3;
export const DEFAULT_DIFFICULTY = 2;

/** Window of recent sessions used for adaptation (inclusive). */
export const RECENT_SESSION_MIN = 3;
export const RECENT_SESSION_MAX = 5;

export type GameId =
  | "memory_cards"
  | "object_recognition"
  | "pattern_recognition"
  | "daily_routine_recall"
  | "attention"
  | "story_memory"
  | "family_bonding";

export type ResponseBand = "fast" | "normal" | "slow";

/** Activity-performance trend only — not a clinical label. */
export type ActivityTrend = "improving" | "stable" | "declining" | "insufficient_data";

/**
 * Patient-facing band (map to i18n in the UI).
 * Not shown as algorithm output to the patient.
 */
export type PatientRecommendation =
  | "well_done_retry"
  | "great_work"
  | "ready_challenge"
  | "reassure";

export interface GameSessionInput {
  gameId: GameId;
  accuracy: number;
  score: number;
  responseTime: number;
  attempts: number;
  completed: boolean;
  difficulty: number;
  timestamp: string;
}

export interface AdaptiveInput {
  gameId: GameId;
  currentDifficulty: number;
  recentResults: GameSessionInput[];
}

export interface AdaptiveOutput {
  nextDifficulty: number;
  recommendation: PatientRecommendation;
  confidence: number;
  reason: string;
}

export interface PerformanceBreakdown {
  meanAccuracy: number;
  completionRate: number;
  responsePerformance: number;
  consistency: number;
  cognitivePerformanceScore: number;
  responseBand: ResponseBand;
  trend: ActivityTrend;
  sessionCount: number;
}

export interface ResponseTimeThresholds {
  fastMaxSeconds: number;
  normalMaxSeconds: number;
}

export interface ScoreWeights {
  accuracy: number;
  completion: number;
  response: number;
  consistency: number;
}

export const DEFAULT_SCORE_WEIGHTS: ScoreWeights = {
  accuracy: 0.5,
  completion: 0.2,
  response: 0.15,
  consistency: 0.15,
};

/** Per-game mean response-time bands (seconds). Not comparable across games. */
export const RESPONSE_TIME_THRESHOLDS: Record<GameId, ResponseTimeThresholds> = {
  memory_cards: { fastMaxSeconds: 8, normalMaxSeconds: 20 },
  object_recognition: { fastMaxSeconds: 4, normalMaxSeconds: 10 },
  pattern_recognition: { fastMaxSeconds: 5, normalMaxSeconds: 12 },
  daily_routine_recall: { fastMaxSeconds: 6, normalMaxSeconds: 14 },
  attention: { fastMaxSeconds: 10, normalMaxSeconds: 25 },
  story_memory: { fastMaxSeconds: 15, normalMaxSeconds: 35 },
  family_bonding: { fastMaxSeconds: 6, normalMaxSeconds: 15 },
};
