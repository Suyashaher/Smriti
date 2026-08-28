/**
 * useVoice — React hook for voice interaction.
 *
 * Provides a clean API for components to:
 * - Start/stop listening (STT)
 * - Speak i18n keys or raw text (TTS)
 * - Access voice state and capabilities
 * - Process voice commands
 *
 * All voice operations are non-blocking and failure-safe.
 */

import { useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getVoiceService } from "@/services/voice/VoiceService";
import { useVoiceStore } from "@/store/voiceStore";
import { useUiStore } from "@/store/uiStore";
import type { VoiceCommandId } from "@/types";

export function useVoice() {
  const navigate = useNavigate();
  const locale = useUiStore((s) => s.locale);
  const {
    voiceEnabled,
    speechOutputEnabled,
    speechInputEnabled,
    speechRate,
    voiceState,
    lastTranscript,
    capabilities,
    lastError,
    setVoiceState,
    setLastTranscript,
    setLastCommand,
    setLastError,
    detectCapabilities,
  } = useVoiceStore();

  const serviceRef = useRef(getVoiceService());

  // Detect capabilities on mount
  useEffect(() => {
    detectCapabilities();
  }, [detectCapabilities]);

  // Wire up service callbacks
  useEffect(() => {
    const service = serviceRef.current;

    service.onStateChange = (state) => {
      setVoiceState(state);
    };

    service.onTranscript = (transcript, isFinal) => {
      setLastTranscript(transcript);
      if (isFinal) {
        // Auto-process the command
        const match = service.processCommand(locale);
        if (match) {
          setLastCommand(match.commandId);
          executeCommand(match.commandId);
        } else {
          setVoiceState("IDLE");
        }
      }
    };

    service.onError = (error) => {
      setLastError(error);
    };

    return () => {
      service.onStateChange = null;
      service.onTranscript = null;
      service.onError = null;
    };
  }, [locale, setVoiceState, setLastTranscript, setLastCommand, setLastError]);

  // ─── Command Execution ─────────────────────────────

  const executeCommand = useCallback(
    (commandId: VoiceCommandId) => {
      switch (commandId) {
        case "START_GAME":
        case "OPEN_GAMES":
          navigate("/elderly/games");
          break;
        case "OPEN_ROUTINE":
          navigate("/elderly/routine");
          break;
        case "SHOW_REMINDERS":
          navigate("/elderly/reminders");
          break;
        case "GO_HOME":
          navigate("/elderly");
          break;
        case "HELP":
          navigate("/elderly/help");
          break;
        case "GO_BACK":
          navigate(-1);
          break;
        case "REPEAT":
          // Re-speak the last spoken text — handled by individual pages
          break;
      }
    },
    [navigate]
  );

  // ─── Public API ─────────────────────────────────────

  const startListening = useCallback(() => {
    if (!voiceEnabled || !speechInputEnabled) return;
    setLastError(null);
    serviceRef.current.startListening(locale);
  }, [voiceEnabled, speechInputEnabled, locale, setLastError]);

  const stopListening = useCallback(() => {
    serviceRef.current.stopListening();
  }, []);

  const speak = useCallback(
    async (key: string) => {
      if (!voiceEnabled || !speechOutputEnabled) return;
      await serviceRef.current.speak(key, locale, speechRate);
    },
    [voiceEnabled, speechOutputEnabled, locale, speechRate]
  );

  const speakText = useCallback(
    async (text: string) => {
      if (!voiceEnabled || !speechOutputEnabled) return;
      await serviceRef.current.speakText(text, locale, speechRate);
    },
    [voiceEnabled, speechOutputEnabled, locale, speechRate]
  );

  const stopSpeaking = useCallback(() => {
    serviceRef.current.stopSpeaking();
  }, []);

  const testVoice = useCallback(async () => {
    const service = serviceRef.current;
    // Speak a greeting regardless of voiceEnabled setting (it's a test)
    const hour = new Date().getHours();
    const greetingKey =
      hour < 12 ? "home.greetingMorning" : hour < 17 ? "home.greetingAfternoon" : "home.greetingEvening";
    await service.tts.speakKey(greetingKey, locale, speechRate);
  }, [locale, speechRate]);

  return {
    // State
    voiceState,
    lastTranscript,
    lastError,
    capabilities,
    isListening: voiceState === "LISTENING",
    isSpeaking: serviceRef.current.tts.isSpeaking(),
    voiceEnabled,
    speechOutputEnabled,
    speechInputEnabled,

    // Actions
    startListening,
    stopListening,
    speak,
    speakText,
    stopSpeaking,
    testVoice,
  };
}
