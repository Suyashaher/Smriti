import { useNavigate } from "react-router-dom";
import { Brain, Eye, Grid3x3, ListChecks, Salad, BookOpen, Users } from "lucide-react";
import { ElderlyHeader } from "@/components/ElderlyHeader";
import { GameOption } from "@/components/GameOption";
import { useTranslation } from "@/hooks/useTranslation";
import type { GameId } from "@/types";

export function ElderlyGamesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  function open(gameId: GameId): void {
    void navigate(`/elderly/games/${gameId}`);
  }

  return (
    <div className="flex flex-col gap-4">
      <ElderlyHeader title={t("games.title")} />
      <p className="text-xl text-elder-muted">{t("games.choose")}</p>
      <GameOption
        icon={<Brain size={32} />}
        label={t("games.memoryCards")}
        onSelect={() => open("memory_cards")}
      />
      <GameOption
        icon={<Eye size={32} />}
        label={t("games.objectRecognition")}
        onSelect={() => open("object_recognition")}
      />
      <GameOption
        icon={<Grid3x3 size={32} />}
        label={t("games.patternRecognition")}
        onSelect={() => open("pattern_recognition")}
      />
      <GameOption
        icon={<ListChecks size={32} />}
        label={t("games.routineRecall")}
        onSelect={() => open("daily_routine_recall")}
      />
      <GameOption
        icon={<Salad size={32} />}
        label={t("games.attention")}
        onSelect={() => open("attention")}
      />
      <GameOption
        icon={<BookOpen size={32} />}
        label={t("games.storyMemory")}
        onSelect={() => open("story_memory")}
      />
      <GameOption
        icon={<Users size={32} />}
        label={t("games.familyBonding")}
        onSelect={() => open("family_bonding")}
      />
    </div>
  );
}
