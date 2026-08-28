import { useEffect } from "react";
import { ElderlyHeader } from "@/components/ElderlyHeader";
import { VoiceButton } from "@/components/VoiceButton";
import { ElderlyButton } from "@/components/ElderlyButton";
import { useTranslation } from "@/hooks/useTranslation";
import { useVoice } from "@/hooks/useVoice";
import { useVoiceStore } from "@/store/voiceStore";
import {
  Gamepad2,
  CalendarCheck,
  Bell,
  Home,
  HelpCircle,
  ArrowLeft,
  Volume2,
  VolumeX,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

export function ElderlyAssistantPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    voiceState,
    lastTranscript,
    lastError,
    capabilities,
    voiceEnabled,
    startListening,
    stopListening,
    speak,
  } = useVoice();
  const speechOutputEnabled = useVoiceStore((s) => s.speechOutputEnabled);

  // Speak a welcome message on mount (if TTS enabled)
  useEffect(() => {
    if (voiceEnabled && speechOutputEnabled && capabilities.englishTTS) {
      speak("assistant.title");
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMicTap = () => {
    if (voiceState === "LISTENING") {
      stopListening();
    } else if (voiceState !== "UNAVAILABLE") {
      startListening();
    }
  };

  const isVoiceAvailable = voiceEnabled && capabilities.speechRecognition;

  return (
    <div className="flex flex-col gap-6 items-center max-w-lg mx-auto">
      <ElderlyHeader title={t("assistant.title")} />

      {/* Voice capability status */}
      <div className="w-full rounded-2xl bg-elder-surface border-2 border-elder-ink/10 p-4">
        <div className="flex items-center gap-3">
          {capabilities.speechSynthesis ? (
            <Volume2 size={24} className="text-green-600" />
          ) : (
            <VolumeX size={24} className="text-gray-400" />
          )}
          <p className="text-lg">
            {capabilities.speechSynthesis
              ? t("voice.statusAvailable")
              : t("voice.statusLimited")}
          </p>
        </div>
        {!capabilities.khasiTTS && (
          <p className="text-base text-elder-muted mt-2">{t("assistant.noKhasiVoice")}</p>
        )}
      </div>

      {/* Main voice button */}
      <div className="py-6">
        <VoiceButton
          voiceState={isVoiceAvailable ? voiceState : "UNAVAILABLE"}
          onTap={handleMicTap}
          size="large"
        />
      </div>

      {/* Transcript display */}
      {lastTranscript && (
        <div className="w-full rounded-2xl bg-white border-2 border-elder-primary/20 p-4" aria-live="polite">
          <p className="text-sm font-semibold text-elder-muted mb-1">{t("voice.youSaid")}</p>
          <p className="text-2xl font-bold text-elder-ink">{lastTranscript}</p>
        </div>
      )}

      {/* Error display */}
      {lastError && (
        <div className="w-full rounded-2xl bg-red-50 border-2 border-red-200 p-4" role="alert">
          <p className="text-lg text-red-700">{lastError}</p>
        </div>
      )}

      {/* Fallback navigation buttons — always available */}
      <div className="w-full mt-4">
        <p className="text-xl font-semibold text-elder-muted mb-3 text-center">
          {t("voice.orTapBelow")}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <ElderlyButton
            icon={<Gamepad2 size={28} aria-hidden />}
            onClick={() => navigate("/elderly/games")}
          >
            {t("nav.games")}
          </ElderlyButton>
          <ElderlyButton
            icon={<CalendarCheck size={28} aria-hidden />}
            onClick={() => navigate("/elderly/routine")}
          >
            {t("nav.routine")}
          </ElderlyButton>
          <ElderlyButton
            icon={<Bell size={28} aria-hidden />}
            onClick={() => navigate("/elderly/reminders")}
          >
            {t("nav.reminders")}
          </ElderlyButton>
          <ElderlyButton
            icon={<Home size={28} aria-hidden />}
            onClick={() => navigate("/elderly")}
          >
            {t("nav.home")}
          </ElderlyButton>
          <ElderlyButton
            icon={<HelpCircle size={28} aria-hidden />}
            onClick={() => navigate("/elderly/help")}
          >
            {t("nav.help")}
          </ElderlyButton>
          <ElderlyButton
            icon={<ArrowLeft size={28} aria-hidden />}
            onClick={() => navigate(-1)}
          >
            {t("common.back")}
          </ElderlyButton>
        </div>
      </div>
    </div>
  );
}
