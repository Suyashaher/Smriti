import { create } from "zustand";
import type { PatientRecommendation } from "@engine";
import { DEFAULT_DIFFICULTY } from "@engine";
import { getGameDifficulty } from "@/db/gameDifficulty";
import { listGameResults } from "@/db/gameResults";
import { saveResultAndAdapt } from "@/services/adaptivePlay";
import type { GameId, GameResult } from "@/types";

interface GameStore {
  lastResult: GameResult | null;
  recentResults: GameResult[];
  difficultyByGame: Partial<Record<GameId, number>>;
  lastRecommendation: PatientRecommendation | null;
  saving: boolean;
  saveError: string | null;
  saveResult: (result: GameResult) => Promise<GameResult | null>;
  loadDifficulty: (patientId: string, gameId: GameId) => Promise<number>;
  loadRecent: (patientId: string) => Promise<void>;
  clearSaveError: () => void;
  clearRecommendation: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  lastResult: null,
  recentResults: [],
  difficultyByGame: {},
  lastRecommendation: null,
  saving: false,
  saveError: null,
  clearSaveError: () => set({ saveError: null }),
  clearRecommendation: () => set({ lastRecommendation: null }),
  loadDifficulty: async (patientId, gameId) => {
    const record = await getGameDifficulty(patientId, gameId);
    set({
      difficultyByGame: { ...get().difficultyByGame, [gameId]: record.currentDifficulty },
    });
    return record.currentDifficulty;
  },
  saveResult: async (result) => {
    set({ saving: true, saveError: null });
    try {
      const { stored, adaptation } = await saveResultAndAdapt(result);
      set({
        lastResult: stored,
        lastRecommendation: adaptation.recommendation,
        difficultyByGame: {
          ...get().difficultyByGame,
          [stored.gameId]: adaptation.nextDifficulty,
        },
        saving: false,
        saveError: null,
      });
      return stored;
    } catch (error) {
      const message = error instanceof Error ? error.message : "save_failed";
      set({ saving: false, saveError: message });
      return null;
    }
  },
  loadRecent: async (patientId) => {
    const recentResults = await listGameResults(patientId);
    set({ recentResults });
  },
}));

export function difficultyFor(gameId: GameId, map: Partial<Record<GameId, number>>): number {
  return map[gameId] ?? DEFAULT_DIFFICULTY;
}
