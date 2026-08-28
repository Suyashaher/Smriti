import { Link } from "react-router-dom";
import { Volume2, Mic, Play, ArrowLeftRight } from "lucide-react";
import { ElderlyButton } from "@/components/ElderlyButton";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from "@/hooks/useTranslation";
import { useSessionStore } from "@/store/sessionStore";
import { useVoiceStore } from "@/store/voiceStore";
import { getVoiceService } from "@/services/voice/VoiceService";
import { useUiStore } from "@/store/uiStore";

export function CaregiverSettingsPage() {
  const { t } = useTranslation();
  const clearSession = useSessionStore((s) => s.clearSession);
  const locale = useUiStore((s) => s.locale);

  const {
    voiceEnabled,
    speechOutputEnabled,
    speechInputEnabled,
    speechRate,
    capabilities,
    setVoiceEnabled,
    setSpeechOutputEnabled,
    setSpeechInputEnabled,
    setSpeechRate,
    detectCapabilities,
  } = useVoiceStore();

  // Detect on first render
  if (!capabilities.speechSynthesis && !capabilities.speechRecognition) {
    detectCapabilities();
  }

  const handleTestVoice = async () => {
    const service = getVoiceService();
    const hour = new Date().getHours();
    const key =
      hour < 12 ? "voiceFeedback.goodMorning" : hour < 17 ? "voiceFeedback.goodAfternoon" : "voiceFeedback.goodEvening";
    await service.tts.speakKey(key, locale, speechRate);
  };

  const speedLabel =
    speechRate <= 0.6 ? t("voiceSettings.speedSlow") : speechRate >= 1.1 ? t("voiceSettings.speedFast") : t("voiceSettings.speedNormal");

  return (
    <div className="flex max-w-lg flex-col gap-6">
      <h1 className="text-3xl font-bold">{t("caregiver.settingsTitle")}</h1>

      <LanguageSelector />

      {/* ─── Voice Settings ────────────────────────────── */}
      <section className="rounded-2xl border-2 border-elder-ink/10 bg-elder-surface p-5 flex flex-col gap-5">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Volume2 size={24} aria-hidden /> {t("voiceSettings.title")}
        </h2>

        {/* Voice status */}
        <p className="text-lg text-elder-muted">
          {t("voiceSettings.voiceStatus")}:{" "}
          <span className="font-semibold">
            {capabilities.speechSynthesis || capabilities.speechRecognition
              ? t("voice.statusAvailable")
              : t("voice.statusLimited")}
          </span>
        </p>

        {/* Master toggle */}
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xl font-semibold">{t("voiceSettings.masterToggle")}</span>
          <input
            type="checkbox"
            checked={voiceEnabled}
            onChange={(e) => setVoiceEnabled(e.target.checked)}
            className="w-12 h-7 appearance-none bg-gray-300 rounded-full relative cursor-pointer checked:bg-elder-primary transition-colors
              after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-6 after:h-6 after:bg-white after:rounded-full after:transition-transform checked:after:translate-x-5"
            aria-label={t("voiceSettings.masterToggle")}
          />
        </label>

        {voiceEnabled && (
          <>
            {/* Speech output */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-lg flex items-center gap-2">
                <Volume2 size={20} aria-hidden /> {t("voiceSettings.speechOutput")}
              </span>
              <input
                type="checkbox"
                checked={speechOutputEnabled}
                onChange={(e) => setSpeechOutputEnabled(e.target.checked)}
                className="w-12 h-7 appearance-none bg-gray-300 rounded-full relative cursor-pointer checked:bg-elder-primary transition-colors
                  after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-6 after:h-6 after:bg-white after:rounded-full after:transition-transform checked:after:translate-x-5"
                aria-label={t("voiceSettings.speechOutput")}
              />
            </label>

            {/* Speech input */}
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-lg flex items-center gap-2">
                <Mic size={20} aria-hidden /> {t("voiceSettings.speechInput")}
              </span>
              <input
                type="checkbox"
                checked={speechInputEnabled}
                onChange={(e) => setSpeechInputEnabled(e.target.checked)}
                className="w-12 h-7 appearance-none bg-gray-300 rounded-full relative cursor-pointer checked:bg-elder-primary transition-colors
                  after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-6 after:h-6 after:bg-white after:rounded-full after:transition-transform checked:after:translate-x-5"
                aria-label={t("voiceSettings.speechInput")}
              />
            </label>

            {/* Speech speed */}
            <div className="flex flex-col gap-2">
              <label className="text-lg font-semibold" htmlFor="speechRate">
                {t("voiceSettings.speechSpeed")}: {speedLabel}
              </label>
              <input
                id="speechRate"
                type="range"
                min="0.4"
                max="1.4"
                step="0.1"
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="w-full h-3 rounded-full appearance-none bg-gray-200 accent-elder-primary"
                aria-label={t("voiceSettings.speechSpeed")}
              />
              <div className="flex justify-between text-sm text-elder-muted">
                <span>{t("voiceSettings.speedSlow")}</span>
                <span>{t("voiceSettings.speedNormal")}</span>
                <span>{t("voiceSettings.speedFast")}</span>
              </div>
            </div>

            {/* Test voice button */}
            <button
              onClick={handleTestVoice}
              className="flex items-center justify-center gap-2 rounded-xl bg-elder-accent px-6 py-3 text-lg font-bold text-white hover:bg-elder-accent/90 transition-colors"
            >
              <Play size={20} aria-hidden /> {t("voiceSettings.testVoice")}
            </button>
          </>
        )}
      </section>

      <p className="text-lg text-elder-muted">{t("app.disclaimer")}</p>

      <Link to="/" onClick={() => clearSession()}>
        <ElderlyButton variant="secondary" icon={<ArrowLeftRight size={24} aria-hidden />}>
          {t("nav.switchMode")}
        </ElderlyButton>
      </Link>
    </div>
  );
}
