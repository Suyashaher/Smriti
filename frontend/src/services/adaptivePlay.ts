import {
  analyzePerformance,
  recommendDifficulty,
  type AdaptiveOutput,
  type GameSessionInput,
  type PatientRecommendation,
} from "@engine";
import { getGameDifficulty, saveGameDifficulty } from "@/db/gameDifficulty";
import { listGameResultsForGame, saveGameResult } from "@/db/gameResults";
import type { GameResult } from "@/types";

export function toSessionInput(result: GameResult): GameSessionInput {
  return {
    gameId: result.gameId,
    accuracy: result.accuracy,
    score: result.score,
    responseTime: result.responseTime,
    attempts: result.attempts,
    completed: result.completed,
    difficulty: result.difficulty,
    timestamp: result.timestamp,
  };
}

export async function saveResultAndAdapt(result: GameResult): Promise<{
  stored: GameResult;
  adaptation: AdaptiveOutput;
  performanceScore: number;
}> {
  const stored = await saveGameResult(result);
  const recent = await listGameResultsForGame(stored.patientId, stored.gameId, 5);
  const current = await getGameDifficulty(stored.patientId, stored.gameId);
  const sessions = recent.map(toSessionInput);
  const analysis = analyzePerformance(stored.gameId, sessions);
  const adaptation = recommendDifficulty({
    gameId: stored.gameId,
    currentDifficulty: current.currentDifficulty,
    recentResults: sessions,
  });
  await saveGameDifficulty({
    ...current,
    currentDifficulty: adaptation.nextDifficulty,
    lastUpdated: new Date().toISOString(),
    performanceScore: analysis.cognitivePerformanceScore,
  });
  return { stored, adaptation, performanceScore: analysis.cognitivePerformanceScore };
}

export type { PatientRecommendation };
