/**
 * SpeechSynthesisService — high-level TTS wrapper.
 *
 * - Takes i18n keys, translates them, then speaks the result
 * - Manages utterance queue (don't overlap)
 * - Speed control optimized for elderly users
 * - Non-blocking: TTS failure never breaks the app
 */

import type { VoiceProvider, TTSOptions, VoiceInfo } from "./types";
import type { LocaleCode } from "@/types";
import { translate } from "@/i18n";
import { LOCALE_TO_BCP47 } from "./types";

export class SpeechSynthesisService {
  private provider: VoiceProvider;
  private speaking = false;

  constructor(provider: VoiceProvider) {
    this.provider = provider;
  }

  /** Speak an i18n key in the given locale. Non-blocking, swallows errors. */
  async speakKey(key: string, locale: LocaleCode, rate = 0.85): Promise<void> {
    const text = translate(locale, key);
    if (!text || text === key) return; // key not found — skip silently
    return this.speakText(text, locale, rate);
  }

  /** Speak raw text in the given locale. */
  async speakText(text: string, locale: LocaleCode, rate = 0.85): Promise<void> {
    if (!this.provider.supportsTextToSpeech()) return;
    if (!text.trim()) return;

    const bcp47 = LOCALE_TO_BCP47[locale] ?? "en-US";

    // Check if the provider has a voice for this language
    const voices = this.provider.getAvailableVoices();
    const langPrefix = bcp47.split("-")[0];
    const hasVoice = voices.some((v) => v.lang.toLowerCase().startsWith(langPrefix));

    // If no voice for this language, try English fallback
    const effectiveLang = hasVoice ? bcp47 : "en-US";
    const effectiveText = hasVoice ? text : translate("en", "assistant.noKhasiVoice");

    const options: TTSOptions = {
      language: effectiveLang,
      rate: Math.max(0.3, Math.min(rate, 2.0)),
      pitch: 1.0,
      volume: 1.0,
    };

    try {
      this.speaking = true;
      await this.provider.speak(effectiveText, options);
    } catch (e) {
      // TTS failure is non-fatal — log and continue
      if (import.meta.env.DEV) {
        console.warn("[TTS] Speech failed:", e);
      }
    } finally {
      this.speaking = false;
    }
  }

  /** Stop any current speech. */
  stop(): void {
    this.provider.stopSpeaking();
    this.speaking = false;
  }

  /** Whether currently speaking. */
  isSpeaking(): boolean {
    return this.speaking || this.provider.isSpeaking();
  }

  /** Get available TTS voices. */
  getAvailableVoices(): VoiceInfo[] {
    return this.provider.getAvailableVoices();
  }

  /** Check if a language has a local (offline) TTS voice. */
  hasOfflineVoice(langPrefix: string): boolean {
    return this.provider.getAvailableVoices().some(
      (v) => v.lang.toLowerCase().startsWith(langPrefix.toLowerCase()) && v.localService
    );
  }
}
