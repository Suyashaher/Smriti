import { useEffect, useRef, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import type { PatientRecommendation } from "@engine";
import { ElderlyButton } from "@/components/ElderlyButton";
import { ElderlyCard } from "@/components/ElderlyCard";
import { ElderlyHeader } from "@/components/ElderlyHeader";
import { ErrorState } from "@/components/states/ErrorState";
import { LoadingState } from "@/components/states/LoadingState";
import type { GameResult, GameShellPhase } from "@/games/types";
import { useTranslation } from "@/hooks/useTranslation";
import { useGameVoice } from "@/hooks/useGameVoice";

const ENCOURAGEMENT_KEY: Record<PatientRecommendation, string> = {
  well_done_retry: "play.feedbackRetry",
  great_work: "play.feedbackGreat",
  ready_challenge: "play.feedbackChallenge",
  reassure: "play.feedbackReassure",
};

interface GameShellProps {
  title: string;
  instruction: string;
  instructionKey?: string; // i18n key for voice to speak
  phase: GameShellPhase;
  result: GameResult | null;
  saveError: string | null;
  encouragement: PatientRecommendation | null;
  preparing?: boolean;
  onStart: () => void;
  onPlayAgain: () => void;
  onRetrySave: () => void;
  children: ReactNode;
}

export function GameShell({
  title,
  instruction,
  instructionKey,
  phase,
  result,
  saveError,
  encouragement,
  preparing = false,
  onStart,
  onPlayAgain,
  onRetrySave,
  children,
}: GameShellProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { speakInstruction, speakFeedback, stopSpeaking } = useGameVoice();
  const messageKey = encouragement ? ENCOURAGEMENT_KEY[encouragement] : "play.feedbackGreat";

  // Track phase changes for voice
  const prevPhaseRef = useRef<GameShellPhase>(phase);

  useEffect(() => {
    const prevPhase = prevPhaseRef.current;
    prevPhaseRef.current = phase;

    // Speak instruction when game starts playing
    if (phase === "playing" && prevPhase === "ready") {
      if (instructionKey) {
        speakInstruction(instructionKey);
      }
    }

    // Speak feedback when game completes
    if (phase === "done" && prevPhase !== "done") {
      if (encouragement === "reassure") {
        speakFeedback("tryAgain");
      } else if (encouragement === "ready_challenge") {
        speakFeedback("excellent");
      } else {
        speakFeedback("wellDone");
      }
    }

    // Stop speaking when leaving the game
    return () => {
      if (phase !== prevPhaseRef.current) {
        stopSpeaking();
      }
    };
  }, [phase, encouragement, instructionKey, speakInstruction, speakFeedback, stopSpeaking]);

  if (preparing) {
    return (
      <div className="flex flex-col gap-5">
        <ElderlyHeader title={title} />
        <LoadingState />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <ElderlyHeader title={title} />

      {phase === "ready" ? (
        <ElderlyCard>
          <p className="mb-6 text-2xl leading-relaxed">{instruction}</p>
          <ElderlyButton onClick={onStart}>{t("play.start")}</ElderlyButton>
        </ElderlyCard>
      ) : null}

      {phase === "playing" ? children : null}

      {phase === "saving" ? <LoadingState message={t("play.saving")} /> : null}

      {phase === "error" ? (
        <ErrorState message={saveError ?? t("play.saveError")} onRetry={onRetrySave} />
      ) : null}

      {phase === "done" && result ? (
        <ElderlyCard>
          <p className="text-3xl font-bold text-elder-good">{t(messageKey)}</p>
          <p className="mt-4 text-xl text-elder-muted">{t("play.notMedical")}</p>
          <div className="mt-6 flex flex-col gap-3">
            <ElderlyButton onClick={onPlayAgain}>{t("play.playAgain")}</ElderlyButton>
            <ElderlyButton variant="secondary" onClick={() => void navigate("/elderly/games")}>
              {t("play.backToGames")}
            </ElderlyButton>
          </div>
        </ElderlyCard>
      ) : null}
    </div>
  );
}

