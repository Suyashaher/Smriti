import { Mic, MicOff, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import type { VoiceState } from "@/types";

interface VoiceButtonProps {
  voiceState: VoiceState;
  onTap: () => void;
  disabled?: boolean;
  size?: "normal" | "large";
}

/**
 * Large, accessible microphone button with 6 visual states.
 * Designed for elderly users — never relies on color alone.
 * Uses icons + text + animation for every state.
 */
export function VoiceButton({
  voiceState,
  onTap,
  disabled = false,
  size = "large",
}: VoiceButtonProps) {
  const { t } = useTranslation();

  const sizeClass = size === "large" ? "w-28 h-28" : "w-20 h-20";
  const iconSize = size === "large" ? 48 : 32;

  const stateConfig: Record<
    VoiceState,
    { icon: React.ReactNode; label: string; bg: string; ring: string; animate: boolean }
  > = {
    IDLE: {
      icon: <Mic size={iconSize} />,
      label: t("voice.tapToSpeak"),
      bg: "bg-elder-primary text-white",
      ring: "",
      animate: false,
    },
    LISTENING: {
      icon: <Mic size={iconSize} />,
      label: t("voice.listening"),
      bg: "bg-green-600 text-white",
      ring: "ring-4 ring-green-400/60",
      animate: true,
    },
    PROCESSING: {
      icon: <Loader2 size={iconSize} className="animate-spin" />,
      label: t("voice.processing"),
      bg: "bg-elder-accent text-white",
      ring: "",
      animate: false,
    },
    SUCCESS: {
      icon: <CheckCircle size={iconSize} />,
      label: t("voice.understood"),
      bg: "bg-green-600 text-white",
      ring: "",
      animate: false,
    },
    ERROR: {
      icon: <AlertCircle size={iconSize} />,
      label: t("voice.tryAgain"),
      bg: "bg-red-500 text-white",
      ring: "",
      animate: false,
    },
    UNAVAILABLE: {
      icon: <MicOff size={iconSize} />,
      label: t("voice.unavailable"),
      bg: "bg-gray-400 text-white",
      ring: "",
      animate: false,
    },
  };

  const config = stateConfig[voiceState];

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={onTap}
        disabled={disabled || voiceState === "UNAVAILABLE"}
        aria-label={config.label}
        className={`
          ${sizeClass} ${config.bg} ${config.ring}
          relative flex items-center justify-center rounded-full
          shadow-lg transition-all duration-200
          active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus-visible:ring-4 focus-visible:ring-elder-primary/50
        `}
      >
        {/* Pulse ring animation for LISTENING state */}
        {config.animate && (
          <span className="absolute inset-0 rounded-full bg-green-400/30 animate-ping" />
        )}
        <span className="relative z-10" aria-hidden>
          {config.icon}
        </span>
      </button>
      <p
        className={`text-xl font-semibold text-center ${
          voiceState === "ERROR" ? "text-red-600" : "text-elder-muted"
        }`}
        aria-live="polite"
      >
        {config.label}
      </p>
    </div>
  );
}
