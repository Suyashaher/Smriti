import { useCallback, useEffect, useState } from "react";
import { ElderlyButton } from "@/components/ElderlyButton";
import { ElderlyCard } from "@/components/ElderlyCard";
import { GENERIC_ITEMS } from "@/games/content/generic";
import { GameShell } from "@/games/GameShell";
import { buildGameResult, shuffle } from "@/games/scoring";
import { itemCountForDifficulty, type GameShellPhase } from "@/games/types";
import type { GameResult } from "@/games/types";
import { useAdaptivePlay } from "@/hooks/useAdaptivePlay";
import { useGameTimer } from "@/games/useGameTimer";
import { useTranslation } from "@/hooks/useTranslation";

const REVEAL_MS = 6000;

export function MemoryCardsGame() {
  const { t } = useTranslation();
  const { patientId, difficulty, difficultyReady, saveResult, saveError, lastRecommendation } =
    useAdaptivePlay("memory_cards");
  const { markStart, elapsedSeconds } = useGameTimer();

  const [phase, setPhase] = useState<GameShellPhase>("ready");
  const [step, setStep] = useState<"reveal" | "pick">("reveal");
  const [targets, setTargets] = useState<typeof GENERIC_ITEMS>([]);
  const [pool, setPool] = useState<typeof GENERIC_ITEMS>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState<GameResult | null>(null);
  const [saved, setSaved] = useState<GameResult | null>(null);

  const setupRound = useCallback(() => {
    const count = itemCountForDifficulty(difficulty);
    const shuffled = shuffle(GENERIC_ITEMS);
    const shown = shuffled.slice(0, count);
    const distractors = shuffled.slice(count, count + Math.min(4, shuffled.length - count));
    setTargets(shown);
    setPool(shuffle([...shown, ...distractors]));
    setSelected(new Set());
    setStep("reveal");
  }, [difficulty]);

  useEffect(() => {
    if (phase !== "playing" || step !== "reveal") return;
    const id = window.setTimeout(() => setStep("pick"), REVEAL_MS);
    return () => window.clearTimeout(id);
  }, [phase, step]);

  useEffect(() => {
    if (phase === "playing" && step === "pick") {
      markStart();
    }
  }, [phase, step, markStart]);

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

  function finish(): void {
    if (!patientId) return;
    const hits = targets.filter((item) => selected.has(item.id)).length;
    const attempts = Math.max(selected.size, 1);
    const result = buildGameResult({
      patientId,
      gameId: "memory_cards",
      score: hits,
      correct: hits,
      attempts,
      responseTime: elapsedSeconds(),
      difficulty,
      completed: true,
    });
    void persist(result);
  }

  function toggle(id: string): void {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <GameShell
      title={t("games.memoryCards")}
      instruction={t("play.memoryIntro")}
      instructionKey="play.memoryIntro"
      phase={phase}
      result={saved}
      saveError={saveError}
      encouragement={lastRecommendation}
      preparing={!difficultyReady}
      onStart={() => {
        setupRound();
        setPhase("playing");
      }}
      onPlayAgain={() => {
        setSaved(null);
        setPending(null);
        setupRound();
        setPhase("playing");
      }}
      onRetrySave={() => {
        if (pending) void persist(pending);
      }}
    >
      {step === "reveal" ? (
        <ElderlyCard>
          <p className="mb-4 text-2xl font-semibold">{t("play.memoryLook")}</p>
          <ul className="grid grid-cols-2 gap-3">
            {targets.map((item) => (
              <li
                key={item.id}
                className="flex min-h-28 flex-col items-center justify-center rounded-3xl bg-elder-bg text-4xl"
              >
                <span aria-hidden>{item.emoji}</span>
                <span className="mt-2 text-xl font-semibold">{t(item.labelKey)}</span>
              </li>
            ))}
          </ul>
        </ElderlyCard>
      ) : (
        <ElderlyCard>
          <p className="mb-4 text-2xl font-semibold">{t("play.memoryPick")}</p>
          <div className="grid grid-cols-2 gap-3">
            {pool.map((item) => {
              const on = selected.has(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(item.id)}
                  className={`flex min-h-28 flex-col items-center justify-center rounded-3xl border-4 px-2 text-3xl font-semibold ${
                    on ? "border-elder-primary bg-elder-primary/15" : "border-elder-ink/20 bg-elder-bg"
                  }`}
                >
                  <span aria-hidden>{item.emoji}</span>
                  <span className="mt-1 text-xl">{t(item.labelKey)}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-6">
            <ElderlyButton onClick={finish}>{t("play.done")}</ElderlyButton>
          </div>
        </ElderlyCard>
      )}
    </GameShell>
  );
}
