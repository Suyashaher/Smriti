import type { GameId, GameResult } from "@/types";

export function computeAccuracy(correct: number, attempts: number): number {
  if (attempts <= 0) return 0;
  return Math.round((correct / attempts) * 100) / 100;
}

export function meanResponseTimeSeconds(samples: number[]): number {
  if (samples.length === 0) return 0;
  const mean = samples.reduce((sum, value) => sum + value, 0) / samples.length;
  return Math.round(mean * 10) / 10;
}

export function buildGameResult(input: {
  patientId: string;
  gameId: GameId;
  score: number;
  correct: number;
  attempts: number;
  responseTime: number;
  difficulty: number;
  completed: boolean;
}): GameResult {
  return {
    id: crypto.randomUUID(),
    patientId: input.patientId,
    gameId: input.gameId,
    score: input.score,
    accuracy: computeAccuracy(input.correct, input.attempts),
    responseTime: input.responseTime,
    attempts: input.attempts,
    difficulty: input.difficulty,
    completed: input.completed,
    timestamp: new Date().toISOString(),
    synced: false,
  };
}

export function shuffle<T>(items: readonly T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = next[i];
    const b = next[j];
    if (a === undefined || b === undefined) continue;
    next[i] = b;
    next[j] = a;
  }
  return next;
}
