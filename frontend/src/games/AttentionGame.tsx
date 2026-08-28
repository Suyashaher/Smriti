import { useCallback, useState } from "react";
import { ElderlyButton } from "@/components/ElderlyButton";
import { ElderlyCard } from "@/components/ElderlyCard";
import { fruitsOf, GENERIC_ITEMS, nonFruitsOf, type ContentItem } from "@/games/content/generic";
import { GameShell } from "@/games/GameShell";
import { buildGameResult, shuffle } from "@/games/scoring";
import { gridSizeForDifficulty, type GameResult, type GameShellPhase } from "@/games/types";
import { useAdaptivePlay } from "@/hooks/useAdaptivePlay";
import { useGameTimer } from "@/games/useGameTimer";
import { useTranslation } from "@/hooks/useTranslation";

function buildGrid(size: number): ContentItem[] {
  const fruits = shuffle(fruitsOf(GENERIC_ITEMS));
  const others = shuffle(nonFruitsOf(GENERIC_ITEMS));
  return shuffle([...fruits, ...others]).slice(0, size);
}

export function AttentionGame() {
  const { t } = useTranslation();
  const { patientId, difficulty, difficultyReady, saveResult, saveError, lastRecommendation } =
    useAdaptivePlay("attention");
  const { markStart, elapsedSeconds } = useGameTimer();

  const [phase, setPhase] = useState<GameShellPhase>("ready");
  const [grid, setGrid] = useState<ContentItem[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState<GameResult | null>(null);
  const [saved, setSaved] = useState<GameResult | null>(null);

  const setup = useCallback(() => {
    setGrid(buildGrid(gridSizeForDifficulty(difficulty)));
    setSelected(new Set());
    markStart();
  }, [markStart, difficulty]);

  async function persist(result: GameResult): Promise<void> {
    setPending(result);
    setPhase("saving");
    const stored = await saveResult(result);
    if (stored) {
      setSaved(stored);
      setPhase("done");
    } else {
      setPhase("error");
    }
  }

  function toggle(id: string): void {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function finish(): void {
    if (!patientId) return;
    const fruitIds = new Set(fruitsOf(grid).map((item) => item.id));
    const hits = [...selected].filter((id) => fruitIds.has(id)).length;
    const falsePositives = [...selected].filter((id) => !fruitIds.has(id)).length;
    const attempts = Math.max(selected.size, 1);
    const score = Math.max(hits - falsePositives, 0);
    void persist(
      buildGameResult({
        patientId,
        gameId: "attention",
        score,
        correct: hits,
        attempts,
        responseTime: elapsedSeconds(),
        difficulty,
        completed: true,
      }),
    );
  }

  return (
    <GameShell
      title={t("games.attention")}
      instruction={t("play.attentionIntro")}
      instructionKey="play.attentionIntro"
      phase={phase}
      result={saved}
      saveError={saveError}
      encouragement={lastRecommendation}
      preparing={!difficultyReady}
      onStart={() => {
        setup();
        setPhase("playing");
      }}
      onPlayAgain={() => {
        setSaved(null);
        setPending(null);
        setup();
        setPhase("playing");
      }}
      onRetrySave={() => {
        if (pending) void persist(pending);
      }}
    >
      <ElderlyCard>
        <p className="mb-4 text-2xl font-semibold">{t("play.attentionPrompt")}</p>
        <div className="grid grid-cols-3 gap-3">
          {grid.map((item) => {
            const on = selected.has(item.id);
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={on}
                aria-label={t(item.labelKey)}
                onClick={() => toggle(item.id)}
                className={`flex min-h-24 flex-col items-center justify-center rounded-3xl border-4 text-4xl ${
                  on ? "border-elder-primary bg-elder-primary/15" : "border-elder-ink/20 bg-elder-bg"
                }`}
              >
                <span aria-hidden>{item.emoji}</span>
                <span className="mt-1 text-base font-semibold">{t(item.labelKey)}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-6">
          <ElderlyButton onClick={finish}>{t("play.done")}</ElderlyButton>
        </div>
      </ElderlyCard>
    </GameShell>
  );
}
