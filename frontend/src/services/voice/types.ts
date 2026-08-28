/**
 * Voice service type definitions.
 * Provider-independent interfaces for speech-to-text and text-to-speech.
 */

import type { VoiceState, LocaleCode } from "@/types";

/** Result from a speech-to-text operation. */
export interface STTResult {
  transcript: string;
  isFinal: boolean;
  confidence: number;
  language: string;
}

/** Options for text-to-speech. */
export interface TTSOptions {
  language: string;
  rate: number;       // 0.1 – 2.0; default 0.85 for elderly
  pitch: number;      // 0.0 – 2.0
  volume: number;     // 0.0 – 1.0
  voiceURI?: string;  // specific voice
}

/** A detected speech synthesis voice. */
export interface VoiceInfo {
  voiceURI: string;
  name: string;
  lang: string;
  localService: boolean;
  isDefault: boolean;
}

/**
 * Provider interface — any speech engine must implement this.
 * The application never calls browser APIs directly; it goes through a provider.
 */
export interface VoiceProvider {
  readonly name: string;
  readonly connectivityDependent: boolean;

  isAvailable(): boolean;
  supportsSpeechToText(): boolean;
  supportsTextToSpeech(): boolean;
  getSupportedSTTLanguages(): string[];
  getSupportedTTSLanguages(): string[];
  getAvailableVoices(): VoiceInfo[];

  // STT
  startListening(lang: string): void;
  stopListening(): void;

  // TTS
  speak(text: string, options: TTSOptions): Promise<void>;
  stopSpeaking(): void;
  isSpeaking(): boolean;

  // Event callbacks
  onResult: ((result: STTResult) => void) | null;
  onError: ((error: string) => void) | null;
  onStateChange: ((state: VoiceState) => void) | null;
}

/** Maps locale codes to BCP-47 language tags for speech engines. */
export const LOCALE_TO_BCP47: Record<LocaleCode, string> = {
  en: "en-US",
  kh: "kha",  // ISO 639-3 for Khasi; no BCP-47 subtag exists
};

export const DEFAULT_TTS_OPTIONS: TTSOptions = {
  language: "en-US",
  rate: 0.85,
  pitch: 1.0,
  volume: 1.0,
};
