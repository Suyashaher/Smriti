/**
 * VoiceService — top-level orchestrator for all voice functionality.
 *
 * Architecture:
 *   React UI → useVoice hook → VoiceService → VoiceProvider → Browser Speech API
 *
 * Responsibilities:
 * - Selects the best available provider
 * - Exposes VoiceCapabilities
 * - Manages the voice state machine
 * - Coordinates STT → command matching → action dispatch
 * - All audio processed locally by the browser; no data uploaded by our code
 */

import type { VoiceCapabilities, VoiceState, LocaleCode } from "@/types";
import type { VoiceProvider } from "./types";
import { BrowserVoiceProvider } from "./BrowserVoiceProvider";
import { VoiceCommandService, type CommandMatch } from "./VoiceCommandService";
import { SpeechSynthesisService } from "./SpeechSynthesisService";
import { LOCALE_TO_BCP47 } from "./types";

export class VoiceService {
  private provider: VoiceProvider;
  private commandService: VoiceCommandService;
  public tts: SpeechSynthesisService;

  private _state: VoiceState = "IDLE";
  private _lastTranscript = "";
  private _capabilities: VoiceCapabilities;

  // External callbacks
  onStateChange: ((state: VoiceState) => void) | null = null;
  onTranscript: ((transcript: string, isFinal: boolean) => void) | null = null;
  onCommand: ((match: CommandMatch) => void) | null = null;
  onError: ((error: string) => void) | null = null;

  constructor(provider?: VoiceProvider) {
    this.provider = provider ?? new BrowserVoiceProvider();
    this.commandService = new VoiceCommandService();
    this.tts = new SpeechSynthesisService(this.provider);

    // Wire up provider callbacks
    this.provider.onResult = (result) => {
      this._lastTranscript = result.transcript;
      this.onTranscript?.(result.transcript, result.isFinal);

      if (result.isFinal) {
        this.setState("PROCESSING");
      }
    };

    this.provider.onError = (error) => {
      this.onError?.(error);
      this.setState("ERROR");
    };

    this.provider.onStateChange = (state) => {
      this.setState(state);
    };

    // Detect capabilities
    this._capabilities = this.detectCapabilities();
  }

  // ─── State Machine ───────────────────────────────────

  get state(): VoiceState {
    return this._state;
  }

  get lastTranscript(): string {
    return this._lastTranscript;
  }

  get capabilities(): VoiceCapabilities {
    return this._capabilities;
  }

  private setState(state: VoiceState): void {
    this._state = state;
    this.onStateChange?.(state);
  }

  // ─── Capability Detection ────────────────────────────

  detectCapabilities(): VoiceCapabilities {
    const sttSupported = this.provider.supportsSpeechToText();
    const ttsSupported = this.provider.supportsTextToSpeech();
    const ttsLangs = this.provider.getSupportedTTSLanguages();

    const hasEnglishTTS = ttsLangs.some((l) => l.toLowerCase().startsWith("en"));
    const hasKhasiTTS = ttsLangs.some((l) => l.toLowerCase().startsWith("kha"));

    this._capabilities = {
      speechRecognition: sttSupported,
      speechSynthesis: ttsSupported,
      offlineSpeechRecognition: false, // Browser STT is connectivity-dependent
      offlineSpeechSynthesis: hasEnglishTTS, // OS voices are offline
      englishSTT: sttSupported,
      khasiSTT: false, // No Khasi STT model exists
      englishTTS: hasEnglishTTS,
      khasiTTS: hasKhasiTTS, // Will be false — no Khasi TTS voice exists
    };

    if (!sttSupported && !ttsSupported) {
      this.setState("UNAVAILABLE");
    }

    return this._capabilities;
  }

  // ─── STT ─────────────────────────────────────────────

  startListening(locale: LocaleCode): void {
    if (!this.provider.supportsSpeechToText()) {
      this.onError?.("Speech recognition is not available on this device.");
      this.setState("UNAVAILABLE");
      return;
    }

    const bcp47 = LOCALE_TO_BCP47[locale] ?? "en-US";
    this._lastTranscript = "";
    this.provider.startListening(bcp47);
  }

  stopListening(): void {
    this.provider.stopListening();
    this.setState("IDLE");
  }

  /**
   * Process the last transcript as a voice command.
   * Returns the matched command or null.
   */
  processCommand(locale: LocaleCode): CommandMatch | null {
    if (!this._lastTranscript) return null;

    const match = this.commandService.matchCommand(this._lastTranscript, locale);
    if (match && match.confidence >= 0.6) {
      this.setState("SUCCESS");
      this.onCommand?.(match);
      return match;
    }

    // No match found
    this.setState("IDLE");
    return null;
  }

  // ─── TTS Convenience ─────────────────────────────────

  async speak(key: string, locale: LocaleCode, rate?: number): Promise<void> {
    return this.tts.speakKey(key, locale, rate);
  }

  async speakText(text: string, locale: LocaleCode, rate?: number): Promise<void> {
    return this.tts.speakText(text, locale, rate);
  }

  stopSpeaking(): void {
    this.tts.stop();
  }

  // ─── Cleanup ─────────────────────────────────────────

  destroy(): void {
    this.provider.stopListening();
    this.provider.stopSpeaking();
    this.onStateChange = null;
    this.onTranscript = null;
    this.onCommand = null;
    this.onError = null;
  }
}

/** Singleton instance. */
let _instance: VoiceService | null = null;

export function getVoiceService(): VoiceService {
  if (!_instance) {
    _instance = new VoiceService();
  }
  return _instance;
}
