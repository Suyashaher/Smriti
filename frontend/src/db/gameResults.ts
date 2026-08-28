import { db } from "@/db/database";
import type { GameResult } from "@/types";
import { syncService } from "@/services/syncService";
import { api } from "@/services/api/client";

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
  try {
    const res = await api.get<GameResult[]>(`/patients/${patientId}/game-results`, { limit });
    if (res.ok && res.data) {
      return res.data;
    }
  } catch (e) {
    console.error("Failed to fetch game results from API", e);
  }

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
  try {
    const res = await api.get<GameResult[]>(`/patients/${patientId}/game-results`, { limit, gameId });
    if (res.ok && res.data) {
      return res.data;
    }
  } catch (e) {
    console.error("Failed to fetch game results from API", e);
  }

  const rows = await db.gameResults
    .where("patientId")
    .equals(patientId)
    .and((row) => row.gameId === gameId)
    .toArray();
  return rows.sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, limit);
}
