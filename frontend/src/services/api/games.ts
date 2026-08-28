import type { GameResult } from "@/types";
import { api } from "./client";

export interface GameResultDTO extends Omit<GameResult, "synced"> {
  deviceId?: string;
  syncedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const gamesApi = {
  createResult: (result: GameResult) =>
    api.post<GameResultDTO>("/game-results", result),

  getResults: (
    patientId: string,
    opts?: { gameId?: string; limit?: number; from?: string; to?: string },
  ) =>
    api.get<GameResultDTO[]>(`/patients/${patientId}/game-results`, {
      gameId: opts?.gameId,
      limit: opts?.limit,
      from_date: opts?.from,
      to_date: opts?.to,
    }),
};
