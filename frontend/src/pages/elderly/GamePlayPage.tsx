import { Navigate, useParams } from "react-router-dom";
import { AttentionGame } from "@/games/AttentionGame";
import { DailyRoutineRecallGame } from "@/games/DailyRoutineRecallGame";
import { MemoryCardsGame } from "@/games/MemoryCardsGame";
import { ObjectRecognitionGame } from "@/games/ObjectRecognitionGame";
import { PatternRecognitionGame } from "@/games/PatternRecognitionGame";
import { StoryMemoryGame } from "@/games/StoryMemoryGame";
import { FamilyBondingGame } from "@/games/FamilyBondingGame";
import { isGameId } from "@/games/types";
import { ErrorState } from "@/components/states/ErrorState";
import { useTranslation } from "@/hooks/useTranslation";

export function GamePlayPage() {
  const { gameId } = useParams();
  const { t } = useTranslation();

  if (!gameId) {
    return <Navigate to="/elderly/games" replace />;
  }

  if (!isGameId(gameId)) {
    return <ErrorState message={t("play.unknownGame")} />;
  }

  switch (gameId) {
    case "memory_cards":
      return <MemoryCardsGame />;
    case "object_recognition":
      return <ObjectRecognitionGame />;
    case "pattern_recognition":
      return <PatternRecognitionGame />;
    case "daily_routine_recall":
      return <DailyRoutineRecallGame />;
    case "attention":
      return <AttentionGame />;
    case "story_memory":
      return <StoryMemoryGame />;
    case "family_bonding":
      return <FamilyBondingGame />;
  }
}
