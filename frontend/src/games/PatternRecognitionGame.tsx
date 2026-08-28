import { useCallback, useState } from "react";
import { ElderlyButton } from "@/components/ElderlyButton";
import { ElderlyCard } from "@/components/ElderlyCard";
import { PATTERN_COLORS } from "@/games/content/generic";
import { GameShell } from "@/games/GameShell";
import { buildGameResult } from "@/games/scoring";
import { roundsForDifficulty, type GameResult, type GameShellPhase } from "@/games/types";
import { useAdaptivePlay } from "@/hooks/useAdaptivePlay";
import { useGameTimer } from "@/games/useGameTimer";
import { useTranslation } from "@/hooks/useTranslation";

interface Round {
  sequence: string[];
  answer: string;
}

function buildPatterns(): Round[] {
  const [a, b, c] = PATTERN_COLORS;
  if (!a || !b || !c) return [];
  return [
    { sequence: [a.id, b.id, a.id, b.id], answer: a.id },
    { sequence: [a.id, a.id, b.id, b.id], answer: a.id },
    { sequence: [b.id, c.id, b.id, c.id], answer: b.id },
    { sequence: [c.id, a.id, c.id, a.id], answer: c.id },
  ];
}

export function PatternRecognitionGame() {
  const { t } = useTranslation();
  const { patientId, difficulty, difficultyReady, saveResult, saveError, lastRecommendation } =
    useAdaptivePlay("pattern_recognition");
  const { markStart, elapsedSeconds } = useGameTimer();

  const [phase, setPhase] = useState<GameShellPhase>("ready");
  const [rounds, setRounds] = useState<Round[]>([]);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [times, setTimes] = useState<number[]>([]);
  const [pending, setPending] = useState<GameResult | null>(null);
  const [saved, setSaved] = useState<GameResult | null>(null);
  const [feedback, setFeedback] = useState<"ok" | "no" | null>(null);

  const setup = useCallback(() => {
    const all = buildPatterns();
    const fifth = all[0];
    const withHard = fifth ? [...all, { ...fifth, sequence: [...fifth.sequence, fifth.answer] }] : all;
    setRounds(withHard.slice(0, roundsForDifficulty(difficulty)));
    setIndex(0);
    setCorrect(0);
    setAttempts(0);
    setTimes([]);
    setFeedback(null);
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

  function complete(nextCorrect: number, nextAttempts: number, nextTimes: number[]): void {
    if (!patientId) return;
    const mean =
      nextTimes.length === 0
        ? elapsedSeconds()
        : Math.round((nextTimes.reduce((s, n) => s + n, 0) / nextTimes.length) * 10) / 10;
    void persist(
      buildGameResult({
        patientId,
        gameId: "pattern_recognition",
        score: nextCorrect,
        correct: nextCorrect,
        attempts: nextAttempts,
        responseTime: mean,
        difficulty,
        completed: true,
      }),
    );
  }

  function pick(id: string): void {
    const round = rounds[index];
    if (!round || feedback) return;
    const ok = id === round.answer;
    const nextCorrect = correct + (ok ? 1 : 0);
    const nextAttempts = attempts + 1;
    const nextTimes = [...times, elapsedSeconds()];
    setCorrect(nextCorrect);
    setAttempts(nextAttempts);
    setTimes(nextTimes);
    setFeedback(ok ? "ok" : "no");
    window.setTimeout(() => {
      setFeedback(null);
      if (index + 1 >= rounds.length) complete(nextCorrect, nextAttempts, nextTimes);
      else {
        setIndex(index + 1);
        markStart();
      }
    }, 700);
  }

  const round = rounds[index];
  const colorById = new Map(PATTERN_COLORS.map((color) => [color.id, color]));

  return (
    <GameShell
      title={t("games.patternRecognition")}
      instruction={t("play.patternIntro")}
      instructionKey="play.patternIntro"
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
      {round ? (
        <ElderlyCard>
          <p className="text-xl text-elder-muted">
            {t("play.round")} {index + 1} / {rounds.length}
          </p>
          <p className="mt-2 text-2xl font-semibold">{t("play.patternPrompt")}</p>
          <ol className="mt-4 flex flex-wrap items-center gap-3">
            {round.sequence.map((id, seqIndex) => {
              const color = colorById.get(id);
              return (
                <li
                  key={`${id}-${seqIndex}`}
                  className={`flex h-20 w-20 items-center justify-center rounded-2xl text-center text-sm font-bold ${color?.className ?? "bg-elder-ink text-white"}`}
                >
                  {color ? t(color.labelKey) : id}
                </li>
              );
            })}
            <li className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-dashed border-elder-ink text-3xl">
              ?
            </li>
          </ol>
          {feedback ? (
            <p className="mt-4 text-2xl font-bold">
              {feedback === "ok" ? t("play.correct") : t("play.tryAgain")}
            </p>
          ) : null}
          <div className="mt-6 flex flex-col gap-3">
            {PATTERN_COLORS.map((color) => (
              <ElderlyButton
                key={color.id}
                variant="secondary"
                disabled={feedback !== null}
                onClick={() => pick(color.id)}
              >
                {t(color.labelKey)}
              </ElderlyButton>
            ))}
          </div>
        </ElderlyCard>
      ) : null}
    </GameShell>
  );
}
