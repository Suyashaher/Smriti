import { useEffect, useState } from "react";
import { difficultyFor, useGameStore } from "@/store/gameStore";
import { useSessionStore } from "@/store/sessionStore";
import type { GameId } from "@/types";

export function useAdaptivePlay(gameId: GameId) {
  const patientId = useSessionStore((s) => s.session?.patientId);
  const difficultyByGame = useGameStore((s) => s.difficultyByGame);
  const loadDifficulty = useGameStore((s) => s.loadDifficulty);
  const saveResult = useGameStore((s) => s.saveResult);
  const saveError = useGameStore((s) => s.saveError);
  const lastRecommendation = useGameStore((s) => s.lastRecommendation);
  const clearRecommendation = useGameStore((s) => s.clearRecommendation);
  const difficulty = difficultyFor(gameId, difficultyByGame);
  const [difficultyReady, setDifficultyReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setDifficultyReady(false);
    clearRecommendation();
    if (!patientId) {
      setDifficultyReady(true);
      return;
    }
    void loadDifficulty(patientId, gameId).then(() => {
      if (!cancelled) setDifficultyReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, [patientId, gameId, loadDifficulty, clearRecommendation]);

  return {
    patientId,
    difficulty,
    difficultyReady,
    saveResult,
    saveError,
    lastRecommendation,
  };
}
