import { db } from "@/db/database";
import type { GameResult } from "@/types";
import { syncService } from "@/services/syncService";

export async function saveGameResult(result: GameResult): Promise<GameResult> {
  const stored: GameResult = { ...result, synced: false };
  await db.gameResults.put(stored);

  await syncService.enqueue(
    "GAME_RESULT",
    stored.id,
    "CREATE",
    stored.patientId,
    stored
  ).catch(console.error);

  return stored;
}

export async function listGameResults(patientId: string, limit = 20): Promise<GameResult[]> {
  const rows = await db.gameResults.where("patientId").equals(patientId).toArray();
  return rows
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, limit);
}

export async function listGameResultsForGame(
  patientId: string,
  gameId: GameResult["gameId"],
  limit = 5,
): Promise<GameResult[]> {
  const rows = await db.gameResults
    .where("patientId")
    .equals(patientId)
    .and((row) => row.gameId === gameId)
    .toArray();
  return rows.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, limit);
}
