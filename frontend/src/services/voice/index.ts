/**
 * Voice module public API.
 */

export { BrowserVoiceProvider } from "./BrowserVoiceProvider";
export { VoiceCommandService } from "./VoiceCommandService";
export { SpeechSynthesisService } from "./SpeechSynthesisService";
export { VoiceService, getVoiceService } from "./VoiceService";
export { COMMAND_REGISTRY } from "./commandRegistry";

export type {
  VoiceProvider,
  STTResult,
  TTSOptions,
  VoiceInfo,
} from "./types";

export { LOCALE_TO_BCP47, DEFAULT_TTS_OPTIONS } from "./types";
