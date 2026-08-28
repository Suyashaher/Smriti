import { useState, useCallback, useEffect } from "react";
import { ElderlyButton } from "@/components/ElderlyButton";
import { ElderlyCard } from "@/components/ElderlyCard";
import { GameShell } from "@/games/GameShell";
import { buildGameResult } from "@/games/scoring";
import type { GameShellPhase, GameResult } from "@/games/types";
import { useAdaptivePlay } from "@/hooks/useAdaptivePlay";
import { useGameTimer } from "@/games/useGameTimer";
import { useTranslation } from "@/hooks/useTranslation";
import { useGameVoice } from "@/hooks/useGameVoice";
import { getStoryForDifficulty, type StoryData } from "./content/stories";

export function StoryMemoryGame() {
  const { t } = useTranslation();
  const { patientId, difficulty, difficultyReady, saveResult, saveError, lastRecommendation } =
    useAdaptivePlay("story_memory");
  const { markStart, elapsedSeconds } = useGameTimer();
  const { speakInstruction, speakFeedback, stopSpeaking } = useGameVoice();

  const [phase, setPhase] = useState<GameShellPhase>("ready");
  const [step, setStep] = useState<"read" | "answer">("read");
  const [story, setStory] = useState<StoryData | null>(null);
  
  const [questionIndex, setQuestionIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [attempts, setAttempts] = useState(0);
  
  const [pending, setPending] = useState<GameResult | null>(null);
  const [saved, setSaved] = useState<GameResult | null>(null);

  const [replaysLeft, setReplaysLeft] = useState(0);

  const setupRound = useCallback(() => {
    const selectedStory = getStoryForDifficulty(difficulty);
    setStory(selectedStory);
    
    // Set replay rules based on difficulty band
    let replays = 0;
    if (difficulty <= 3) replays = 99; // Unlimited for easy
    else if (difficulty <= 7) replays = 1; // 1 for medium
    
    setReplaysLeft(replays);
    setQuestionIndex(0);
    setCorrectCount(0);
    setAttempts(0);
    setStep("read");
  }, [difficulty]);

  useEffect(() => {
    if (phase === "playing" && step === "answer" && questionIndex === 0) {
      markStart();
    }
  }, [phase, step, questionIndex, markStart]);

  // Clean up voice when component unmounts
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, [stopSpeaking]);

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

  function finishGame(finalCorrect: number, finalAttempts: number): void {
    if (!patientId) return;
    const result = buildGameResult({
      patientId,
      gameId: "story_memory",
      score: finalCorrect,
      correct: finalCorrect,
      attempts: finalAttempts,
      responseTime: elapsedSeconds(),
      difficulty,
      completed: true,
    });
    void persist(result);
  }

  const handleStartQuestions = () => {
    stopSpeaking();
    setStep("answer");
  };

  const handleReadAloud = () => {
    if (story) {
      speakInstruction(story.textKey);
      if (replaysLeft < 99) {
        setReplaysLeft(prev => Math.max(0, prev - 1));
      }
    }
  };

  const handleAnswer = (choiceIndex: number) => {
    if (!story) return;
    
    const isCorrect = choiceIndex === story.questions[questionIndex].correctIndex;
    const newAttempts = attempts + 1;
    const newCorrect = isCorrect ? correctCount + 1 : correctCount;
    
    setAttempts(newAttempts);
    if (isCorrect) {
      setCorrectCount(newCorrect);
      speakFeedback("correct");
    } else {
      speakFeedback("tryAgain");
    }

    if (questionIndex < story.questions.length - 1) {
      setTimeout(() => {
        setQuestionIndex(prev => prev + 1);
      }, 1000);
    } else {
      setTimeout(() => {
        finishGame(newCorrect, newAttempts);
      }, 1000);
    }
  };

  return (
    <GameShell
      title={t("games.storyMemory")}
      instruction={t("play.storyIntro")}
      instructionKey="play.storyIntro"
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
      {phase === "playing" && story && (
        <ElderlyCard>
          {step === "read" ? (
            <div className="flex flex-col gap-6">
              <h2 className="text-3xl font-bold text-center">{t(story.titleKey)}</h2>
              <p className="text-2xl leading-relaxed bg-elder-bg p-6 rounded-2xl">
                {t(story.textKey)}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <ElderlyButton 
                  onClick={handleReadAloud} 
                  variant="secondary"
                  disabled={replaysLeft === 0}
                >
                  {replaysLeft > 0 ? t("play.storyListen") : "No more replays"}
                </ElderlyButton>
                
                <ElderlyButton onClick={handleStartQuestions}>
                  I'm ready
                </ElderlyButton>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              <div className="text-center">
                <p className="text-xl text-elder-muted font-semibold mb-2">
                  Question {questionIndex + 1} of {story.questions.length}
                </p>
                <h3 className="text-3xl font-bold">
                  {t(story.questions[questionIndex].questionKey)}
                </h3>
              </div>
              
              <div className="flex flex-col gap-4">
                {story.questions[questionIndex].choicesKeys.map((choiceKey, i) => (
                  <button
                    key={choiceKey}
                    onClick={() => handleAnswer(i)}
                    className="p-6 text-2xl font-semibold bg-elder-bg hover:bg-elder-primary/10 border-4 border-elder-ink/10 rounded-2xl transition-colors text-left"
                  >
                    {t(choiceKey)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </ElderlyCard>
      )}
    </GameShell>
  );
}
