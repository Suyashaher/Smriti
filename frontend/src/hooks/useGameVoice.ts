/**
 * useGameVoice — lightweight hook for voice feedback in games.
 *
 * Usage:
 *   const { speakInstruction, speakFeedback } = useGameVoice();
 *   speakInstruction("play.memoryIntro");   // on game start
 *   speakFeedback("correct");               // on correct answer
 */

import { useCallback, useRef } from "react";
import { getVoiceService } from "@/services/voice/VoiceService";
import { useVoiceStore } from "@/store/voiceStore";
import { useUiStore } from "@/store/uiStore";

export function useGameVoice() {
  const locale = useUiStore((s) => s.locale);
  const voiceEnabled = useVoiceStore((s) => s.voiceEnabled);
  const speechOutputEnabled = useVoiceStore((s) => s.speechOutputEnabled);
  const speechRate = useVoiceStore((s) => s.speechRate);
  const serviceRef = useRef(getVoiceService());

  const isActive = voiceEnabled && speechOutputEnabled;

  /** Speak an i18n key (e.g. "play.memoryIntro"). Non-blocking. */
  const speakInstruction = useCallback(
    (key: string) => {
      if (!isActive) return;
      serviceRef.current.tts.speakKey(key, locale, speechRate).catch(() => {});
    },
    [isActive, locale, speechRate]
  );

  /** Speak game feedback. Maps short names to i18n keys. */
  const speakFeedback = useCallback(
    (type: "correct" | "tryAgain" | "wellDone" | "excellent" | "gameStart" | "gameComplete") => {
      if (!isActive) return;
      const keyMap: Record<string, string> = {
        correct: "play.correct",
        tryAgain: "play.feedbackReassure",
        wellDone: "voiceFeedback.wellDone",
        excellent: "voiceFeedback.excellent",
        gameStart: "voiceFeedback.gameStart",
        gameComplete: "voiceFeedback.gameComplete",
      };
      const key = keyMap[type];
      if (key) {
        serviceRef.current.tts.speakKey(key, locale, speechRate).catch(() => {});
      }
    },
    [isActive, locale, speechRate]
  );

  /** Stop any current speech. */
  const stopSpeaking = useCallback(() => {
    serviceRef.current.tts.stop();
  }, []);

  return { speakInstruction, speakFeedback, stopSpeaking, isActive };
}
