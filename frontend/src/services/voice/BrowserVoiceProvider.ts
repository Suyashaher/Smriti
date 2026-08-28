/**
 * BrowserVoiceProvider — concrete VoiceProvider using the Web Speech API.
 *
 * STT: Uses SpeechRecognition / webkitSpeechRecognition.
 *   ⚠ CONNECTIVITY-DEPENDENT in Chrome/Edge (audio sent to Google/Microsoft).
 *   Firefox may use local models on some platforms but is not reliable.
 *
 * TTS: Uses SpeechSynthesis with OS-installed voices.
 *   ✅ GENUINELY OFFLINE when using localService voices.
 *
 * Privacy: We do not record, persist, or upload raw audio.
 * The browser engine handles audio processing; we only receive transcripts.
 */

import type { VoiceProvider, STTResult, TTSOptions, VoiceInfo } from "./types";
import type { VoiceState } from "@/types";

// Web Speech API types (not in standard TS libs)
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

// Resolve the SpeechRecognition constructor across browsers
const SpeechRecognitionCtor: any =
  typeof window !== "undefined"
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : undefined;

export class BrowserVoiceProvider implements VoiceProvider {
  readonly name = "Browser Web Speech API";
  readonly connectivityDependent = true; // STT requires network in Chrome

  private recognition: any | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private cachedVoices: VoiceInfo[] = [];

  // Event callbacks
  onResult: ((result: STTResult) => void) | null = null;
  onError: ((error: string) => void) | null = null;
  onStateChange: ((state: VoiceState) => void) | null = null;

  constructor() {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      this.synthesis = window.speechSynthesis;
      // Voices load asynchronously on some browsers
      this.synthesis.onvoiceschanged = () => this.refreshVoices();
      this.refreshVoices();
    }
  }

  private refreshVoices(): void {
    if (!this.synthesis) return;
    this.cachedVoices = this.synthesis.getVoices().map((v) => ({
      voiceURI: v.voiceURI,
      name: v.name,
      lang: v.lang,
      localService: v.localService,
      isDefault: v.default,
    }));
  }

  isAvailable(): boolean {
    return this.supportsSpeechToText() || this.supportsTextToSpeech();
  }

  supportsSpeechToText(): boolean {
    return !!SpeechRecognitionCtor;
  }

  supportsTextToSpeech(): boolean {
    return !!this.synthesis;
  }

  getSupportedSTTLanguages(): string[] {
    // The Web Speech API theoretically supports many languages
    // but we can only verify English via the API itself.
    // Khasi is not supported.
    if (!SpeechRecognitionCtor) return [];
    return ["en-US", "en-GB", "en-IN"];
  }

  getSupportedTTSLanguages(): string[] {
    const langs = new Set<string>();
    for (const v of this.cachedVoices) {
      if (v.localService) {
        langs.add(v.lang);
      }
    }
    return Array.from(langs);
  }

  getAvailableVoices(): VoiceInfo[] {
    return this.cachedVoices;
  }

  // ─── STT ────────────────────────────────────────────

  startListening(lang: string): void {
    if (!SpeechRecognitionCtor) {
      this.onError?.("Speech recognition is not supported on this browser.");
      this.onStateChange?.("UNAVAILABLE");
      return;
    }

    // Stop any existing session
    this.stopListening();

    this.recognition = new SpeechRecognitionCtor();
    this.recognition.lang = lang;
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      this.onStateChange?.("LISTENING");
    };

    this.recognition.onresult = (event: any) => {
      const last = event.results[event.results.length - 1];
      if (last) {
        this.onResult?.({
          transcript: last[0].transcript,
          isFinal: last.isFinal,
          confidence: last[0].confidence,
          language: lang,
        });
        if (last.isFinal) {
          this.onStateChange?.("PROCESSING");
        }
      }
    };

    this.recognition.onerror = (event: any) => {
      const friendlyMessages: Record<string, string> = {
        "not-allowed": "Microphone permission was denied.",
        "no-speech": "No speech was detected. Please try again.",
        "network": "Speech recognition requires an internet connection.",
        "audio-capture": "No microphone was found on this device.",
        "aborted": "Speech recognition was stopped.",
      };
      const message = friendlyMessages[event.error] || `Speech error: ${event.error}`;
      this.onError?.(message);
      this.onStateChange?.("ERROR");
    };

    this.recognition.onend = () => {
      // Only go to IDLE if we aren't already in PROCESSING or ERROR
      // (onend fires after onerror too)
    };

    try {
      this.recognition.start();
    } catch (e) {
      this.onError?.("Could not start speech recognition.");
      this.onStateChange?.("ERROR");
    }
  }

  stopListening(): void {
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {
        // ignore
      }
      this.recognition = null;
    }
  }

  // ─── TTS ────────────────────────────────────────────

  async speak(text: string, options: TTSOptions): Promise<void> {
    if (!this.synthesis) {
      this.onError?.("Speech synthesis is not available on this device.");
      return;
    }

    return new Promise<void>((resolve, reject) => {
      // Cancel any queued utterances
      this.synthesis!.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options.language;
      utterance.rate = options.rate;
      utterance.pitch = options.pitch;
      utterance.volume = options.volume;

      // Try to find a matching local voice
      if (options.voiceURI) {
        const match = this.synthesis!.getVoices().find((v) => v.voiceURI === options.voiceURI);
        if (match) utterance.voice = match;
      } else {
        // Prefer a local voice for the requested language
        const localVoice = this.synthesis!.getVoices().find(
          (v) => v.lang.startsWith(options.language.split("-")[0]) && v.localService
        );
        if (localVoice) utterance.voice = localVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = (e) => {
        // Don't reject on 'interrupted' — that's normal when we cancel
        if (e.error === "interrupted") {
          resolve();
        } else {
          reject(new Error(`TTS error: ${e.error}`));
        }
      };

      this.synthesis!.speak(utterance);
    });
  }

  stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  isSpeaking(): boolean {
    return this.synthesis?.speaking ?? false;
  }
}
