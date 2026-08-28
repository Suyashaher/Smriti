import { DEFAULT_DIFFICULTY } from "@engine";
import { db } from "@/db/database";
import type { GameDifficultyRecord, GameId } from "@/types";

export function difficultyRecordId(patientId: string, gameId: GameId): string {
  return `${patientId}__${gameId}`;
}

export async function getGameDifficulty(
  patientId: string,
  gameId: GameId,
): Promise<GameDifficultyRecord> {
  const id = difficultyRecordId(patientId, gameId);
  const existing = await db.gameDifficulty.get(id);
  if (existing) return existing;
  const created: GameDifficultyRecord = {
    id,
    patientId,
    gameId,
    currentDifficulty: DEFAULT_DIFFICULTY,
    lastUpdated: new Date().toISOString(),
    performanceScore: 0,
  };
  await db.gameDifficulty.put(created);
  return created;
}

export async function saveGameDifficulty(record: GameDifficultyRecord): Promise<void> {
  await db.gameDifficulty.put(record);
}
