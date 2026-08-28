/**
 * Command registry — maps spoken phrases to normalized command IDs.
 * Language-independent: English and Khasi phrases map to the same IDs.
 *
 * Khasi phrases are best-effort and marked for native validation.
 */

import type { VoiceCommandId, LocaleCode } from "@/types";

export interface CommandEntry {
  phrases: string[];
  commandId: VoiceCommandId;
}

/**
 * Registry of voice commands per locale.
 * Phrases are lowercase, normalized. The matcher will lowercase the transcript before comparison.
 */
export const COMMAND_REGISTRY: Record<LocaleCode, CommandEntry[]> = {
  en: [
    { commandId: "START_GAME",     phrases: ["start game", "play game", "start", "play"] },
    { commandId: "OPEN_GAMES",     phrases: ["open games", "games", "show games", "go to games"] },
    { commandId: "OPEN_ROUTINE",   phrases: ["open routine", "routine", "today", "daily routine", "show routine"] },
    { commandId: "SHOW_REMINDERS", phrases: ["show reminders", "reminders", "open reminders", "my reminders"] },
    { commandId: "GO_HOME",        phrases: ["go home", "home", "main", "go to home"] },
    { commandId: "REPEAT",         phrases: ["repeat", "say again", "what", "again"] },
    { commandId: "HELP",           phrases: ["help", "help me", "i need help"] },
    { commandId: "GO_BACK",        phrases: ["go back", "back", "previous"] },
  ],
  kh: [
    // [NEEDS NATIVE VALIDATION] — all Khasi phrases require native speaker review
    { commandId: "START_GAME",     phrases: ["sdang jingialang", "sdang", "ialang"] },
    { commandId: "OPEN_GAMES",     phrases: ["plie ki jingialang", "ki jingialang"] },
    { commandId: "OPEN_ROUTINE",   phrases: ["ka jingïalad", "mynta", "jingïalad sngi"] },
    { commandId: "SHOW_REMINDERS", phrases: ["ki jingpynkynmaw", "pynkynmaw"] },
    { commandId: "GO_HOME",        phrases: ["ïing", "sha ïing", "phai sha ïing"] },
    { commandId: "REPEAT",         phrases: ["ong biang", "biang", "aiu"] },
    { commandId: "HELP",           phrases: ["jingïarap", "ïarap", "ïarap ia nga"] },
    { commandId: "GO_BACK",        phrases: ["phai shuh", "shuh"] },
  ],
};
