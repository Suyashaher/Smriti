/**
 * Voice state store — Zustand store for voice UI state.
 * Persists user preferences (voiceEnabled, speechRate, etc.) to IndexedDB.
 */

import { create } from "zustand";
import type { VoiceState, VoiceCapabilities, VoiceCommandId } from "@/types";
import { getVoiceService } from "@/services/voice/VoiceService";

interface VoiceStoreState {
  // User preferences (persisted)
  voiceEnabled: boolean;
  speechOutputEnabled: boolean;
  speechInputEnabled: boolean;
  speechRate: number;

  // Runtime state (not persisted)
  voiceState: VoiceState;
  lastTranscript: string;
  lastCommand: VoiceCommandId | null;
  lastError: string | null;
  capabilities: VoiceCapabilities;

  // Actions
  setVoiceEnabled: (v: boolean) => void;
  setSpeechOutputEnabled: (v: boolean) => void;
  setSpeechInputEnabled: (v: boolean) => void;
  setSpeechRate: (r: number) => void;
  setVoiceState: (s: VoiceState) => void;
  setLastTranscript: (t: string) => void;
  setLastCommand: (c: VoiceCommandId | null) => void;
  setLastError: (e: string | null) => void;
  detectCapabilities: () => void;
  initFromSettings: (settings: {
    voiceEnabled: boolean;
    speechOutputEnabled: boolean;
    speechInputEnabled: boolean;
    speechRate: number;
  }) => void;
}

const DEFAULT_CAPABILITIES: VoiceCapabilities = {
  speechRecognition: false,
  speechSynthesis: false,
  offlineSpeechRecognition: false,
  offlineSpeechSynthesis: false,
  englishSTT: false,
  khasiSTT: false,
  englishTTS: false,
  khasiTTS: false,
};

export const useVoiceStore = create<VoiceStoreState>((set) => ({
  voiceEnabled: false,
  speechOutputEnabled: true,
  speechInputEnabled: true,
  speechRate: 0.85,

  voiceState: "IDLE",
  lastTranscript: "",
  lastCommand: null,
  lastError: null,
  capabilities: DEFAULT_CAPABILITIES,

  setVoiceEnabled: (v) => set({ voiceEnabled: v }),
  setSpeechOutputEnabled: (v) => set({ speechOutputEnabled: v }),
  setSpeechInputEnabled: (v) => set({ speechInputEnabled: v }),
  setSpeechRate: (r) => set({ speechRate: Math.max(0.3, Math.min(r, 2.0)) }),
  setVoiceState: (s) => set({ voiceState: s }),
  setLastTranscript: (t) => set({ lastTranscript: t }),
  setLastCommand: (c) => set({ lastCommand: c }),
  setLastError: (e) => set({ lastError: e }),

  detectCapabilities: () => {
    try {
      const service = getVoiceService();
      const caps = service.detectCapabilities();
      set({ capabilities: caps });
    } catch {
      set({ capabilities: DEFAULT_CAPABILITIES });
    }
  },

  initFromSettings: (settings) => {
    set({
      voiceEnabled: settings.voiceEnabled,
      speechOutputEnabled: settings.speechOutputEnabled,
      speechInputEnabled: settings.speechInputEnabled,
      speechRate: settings.speechRate,
    });
  },
}));
