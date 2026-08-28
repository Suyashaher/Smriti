import { analyzePerformance, activityTrend, type ActivityTrend } from "@engine";
import { getGameDifficulty } from "@/db/gameDifficulty";
import { listGameResults, listGameResultsForGame } from "@/db/gameResults";
import { toSessionInput } from "@/services/adaptivePlay";
import type { GameId } from "@/types";

export interface GamePerformanceSlice {
  gameId: GameId;
  difficulty: number;
  performanceScore: number;
  sessions: number;
  trend: ActivityTrend;
}

export interface PatientPerformance {
  overallScore: number;
  gamesPlayed: number;
  recentTrend: ActivityTrend;
  gamePerformance: {
    memoryCards: GamePerformanceSlice;
    objectRecognition: GamePerformanceSlice;
    patternRecognition: GamePerformanceSlice;
    routineRecall: GamePerformanceSlice;
    attention: GamePerformanceSlice;
    storyMemory: GamePerformanceSlice;
    familyBonding: GamePerformanceSlice;
  };
}

const GAME_KEYS = {
  memory_cards: "memoryCards",
  object_recognition: "objectRecognition",
  pattern_recognition: "patternRecognition",
  daily_routine_recall: "routineRecall",
  attention: "attention",
  story_memory: "storyMemory",
  family_bonding: "familyBonding",
} as const satisfies Record<GameId, keyof PatientPerformance["gamePerformance"]>;

async function sliceFor(patientId: string, gameId: GameId): Promise<GamePerformanceSlice> {
  const [recent, difficulty] = await Promise.all([
    listGameResultsForGame(patientId, gameId, 5),
    getGameDifficulty(patientId, gameId),
  ]);
  const analysis = analyzePerformance(gameId, recent.map(toSessionInput));
  return {
    gameId,
    difficulty: difficulty.currentDifficulty,
    performanceScore: analysis.cognitivePerformanceScore,
    sessions: analysis.sessionCount,
    trend: analysis.trend,
  };
}

/**
 * Caregiver analytics preparation. Not shown on the patient UI.
 * Overall figures are activity performance only — not a medical assessment.
 */
export async function getPatientPerformance(patientId: string): Promise<PatientPerformance> {
  const all = await listGameResults(patientId, 50);
  const memoryCards = await sliceFor(patientId, "memory_cards");
  const objectRecognition = await sliceFor(patientId, "object_recognition");
  const patternRecognition = await sliceFor(patientId, "pattern_recognition");
  const routineRecall = await sliceFor(patientId, "daily_routine_recall");
  const attention = await sliceFor(patientId, "attention");
  const storyMemory = await sliceFor(patientId, "story_memory");
  const familyBonding = await sliceFor(patientId, "family_bonding");
  const slices = [memoryCards, objectRecognition, patternRecognition, routineRecall, attention, storyMemory, familyBonding];
  const scored = slices.filter((row) => row.sessions > 0);
  const overallScore =
    scored.length === 0
      ? 0
      : Math.round(scored.reduce((sum, row) => sum + row.performanceScore, 0) / scored.length);
  const chronological = [...all].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  const recentTrend = activityTrend(chronological.slice(-5).map((row) => row.accuracy));

  return {
    overallScore,
    gamesPlayed: all.length,
    recentTrend,
    gamePerformance: {
      memoryCards,
      objectRecognition,
      patternRecognition,
      routineRecall,
      attention,
      storyMemory,
      familyBonding,
    },
  };
}

export { GAME_KEYS };
