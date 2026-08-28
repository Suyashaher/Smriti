import { useCallback, useState } from "react";
import { ElderlyButton } from "@/components/ElderlyButton";
import { ElderlyCard } from "@/components/ElderlyCard";
import { DEFAULT_ROUTINE } from "@/games/content/generic";
import { GameShell } from "@/games/GameShell";
import { buildGameResult, shuffle } from "@/games/scoring";
import { roundsForDifficulty, type GameResult, type GameShellPhase } from "@/games/types";
import { useAdaptivePlay } from "@/hooks/useAdaptivePlay";
import { useGameTimer } from "@/games/useGameTimer";
import { useTranslation } from "@/hooks/useTranslation";

interface RoutineRound {
  shown: typeof DEFAULT_ROUTINE;
  answer: (typeof DEFAULT_ROUTINE)[number];
  choices: typeof DEFAULT_ROUTINE;
}

function buildRounds(count: number): RoutineRound[] {
  const rounds: RoutineRound[] = [];
  for (let i = 0; i < count; i += 1) {
    const answerIndex = Math.min(i + 2, DEFAULT_ROUTINE.length - 1);
    const answer = DEFAULT_ROUTINE[answerIndex];
    if (!answer) continue;
    const shown = DEFAULT_ROUTINE.slice(0, answerIndex);
    const wrong = shuffle(DEFAULT_ROUTINE.filter((step) => step.id !== answer.id)).slice(0, 2);
    rounds.push({ shown, answer, choices: shuffle([answer, ...wrong]) });
  }
  return rounds;
}

export function DailyRoutineRecallGame() {
  const { t } = useTranslation();
  const { patientId, difficulty, difficultyReady, saveResult, saveError, lastRecommendation } =
    useAdaptivePlay("daily_routine_recall");
  const { markStart, elapsedSeconds } = useGameTimer();

  const [phase, setPhase] = useState<GameShellPhase>("ready");
  const [rounds, setRounds] = useState<RoutineRound[]>([]);
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [times, setTimes] = useState<number[]>([]);
  const [pending, setPending] = useState<GameResult | null>(null);
  const [saved, setSaved] = useState<GameResult | null>(null);
  const [feedback, setFeedback] = useState<"ok" | "no" | null>(null);

  const setup = useCallback(() => {
    setRounds(buildRounds(roundsForDifficulty(difficulty)));
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
        gameId: "daily_routine_recall",
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
    const ok = id === round.answer.id;
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

  return (
    <GameShell
      title={t("games.routineRecall")}
      instruction={t("play.routineIntro")}
      instructionKey="play.routineIntro"
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
          <p className="mt-2 text-2xl font-semibold">{t("play.routinePrompt")}</p>
          <ol className="mt-4 flex flex-col gap-2">
            {round.shown.map((step) => (
              <li key={step.id} className="flex min-h-16 items-center gap-3 rounded-2xl bg-elder-bg px-4 text-2xl">
                <span aria-hidden>{step.emoji}</span>
                {t(step.labelKey)}
              </li>
            ))}
            <li className="flex min-h-16 items-center rounded-2xl border-4 border-dashed border-elder-ink px-4 text-3xl">
              ?
            </li>
          </ol>
          {feedback ? (
            <p className="mt-4 text-2xl font-bold">
              {feedback === "ok" ? t("play.correct") : t("play.tryAgain")}
            </p>
          ) : null}
          <div className="mt-6 flex flex-col gap-3">
            {round.choices.map((choice) => (
              <ElderlyButton
                key={choice.id}
                variant="secondary"
                disabled={feedback !== null}
                onClick={() => pick(choice.id)}
              >
                {choice.emoji} {t(choice.labelKey)}
              </ElderlyButton>
            ))}
          </div>
        </ElderlyCard>
      ) : null}
    </GameShell>
  );
}
