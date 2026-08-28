import { useCallback, useState } from "react";
import { ElderlyButton } from "@/components/ElderlyButton";
import { ElderlyCard } from "@/components/ElderlyCard";
import { GENERIC_ITEMS } from "@/games/content/generic";
import { GameShell } from "@/games/GameShell";
import { buildGameResult, shuffle } from "@/games/scoring";
import { roundsForDifficulty, type GameResult, type GameShellPhase } from "@/games/types";
import { useAdaptivePlay } from "@/hooks/useAdaptivePlay";
import { useGameTimer } from "@/games/useGameTimer";
import { useTranslation } from "@/hooks/useTranslation";

interface Round {
  target: (typeof GENERIC_ITEMS)[number];
  choices: typeof GENERIC_ITEMS;
}

export function ObjectRecognitionGame() {
  const { t } = useTranslation();
  const { patientId, difficulty, difficultyReady, saveResult, saveError, lastRecommendation } =
    useAdaptivePlay("object_recognition");
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
    const built: Round[] = [];
    const pool = shuffle(GENERIC_ITEMS);
    const roundCount = roundsForDifficulty(difficulty);
    for (let i = 0; i < roundCount; i += 1) {
      const target = pool[i % pool.length];
      if (!target) continue;
      const others = shuffle(GENERIC_ITEMS.filter((item) => item.id !== target.id)).slice(0, 3);
      built.push({ target, choices: shuffle([target, ...others]) });
    }
    setRounds(built);
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
        : Math.round((nextTimes.reduce((a, b) => a + b, 0) / nextTimes.length) * 10) / 10;
    const result = buildGameResult({
      patientId,
      gameId: "object_recognition",
      score: nextCorrect,
      correct: nextCorrect,
      attempts: nextAttempts,
      responseTime: mean,
      difficulty,
      completed: true,
    });
    void persist(result);
  }

  function pick(id: string): void {
    const round = rounds[index];
    if (!round || feedback) return;
    const ok = id === round.target.id;
    const nextCorrect = correct + (ok ? 1 : 0);
    const nextAttempts = attempts + 1;
    const nextTimes = [...times, elapsedSeconds()];
    setCorrect(nextCorrect);
    setAttempts(nextAttempts);
    setTimes(nextTimes);
    setFeedback(ok ? "ok" : "no");
    window.setTimeout(() => {
      setFeedback(null);
      if (index + 1 >= rounds.length) {
        complete(nextCorrect, nextAttempts, nextTimes);
      } else {
        setIndex(index + 1);
        markStart();
      }
    }, 700);
  }

  const round = rounds[index];

  return (
    <GameShell
      title={t("games.objectRecognition")}
      instruction={t("play.objectIntro")}
      instructionKey="play.objectIntro"
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
          <p className="mt-2 text-2xl font-semibold">{t("play.objectPrompt")}</p>
          <p className="mt-6 text-center text-7xl" aria-hidden>
            {round.target.emoji}
          </p>
          {feedback ? (
            <p className="mt-4 text-center text-2xl font-bold">
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
                {t(choice.labelKey)}
              </ElderlyButton>
            ))}
          </div>
        </ElderlyCard>
      ) : null}
    </GameShell>
  );
}
