import type { GameId, GameResult } from "@/types";
import { DEFAULT_DIFFICULTY } from "@engine";

export type { GameId, GameResult };
export { DEFAULT_DIFFICULTY };

export const GAME_IDS: GameId[] = [
  "memory_cards",
  "object_recognition",
  "pattern_recognition",
  "daily_routine_recall",
  "attention",
  "story_memory",
  "family_bonding",
];

export function isGameId(value: string | undefined): value is GameId {
  return GAME_IDS.includes(value as GameId);
}

export function itemCountForDifficulty(difficulty: number): number {
  if (difficulty <= 1) return 3;
  if (difficulty >= 3) return 8;
  return 5;
}

export function roundsForDifficulty(difficulty: number): number {
  if (difficulty <= 1) return 3;
  if (difficulty >= 3) return 5;
  return 4;
}

export function gridSizeForDifficulty(difficulty: number): number {
  if (difficulty <= 1) return 8;
  if (difficulty >= 3) return 12;
  return 10;
}

export type GameShellPhase = "ready" | "playing" | "saving" | "done" | "error";
