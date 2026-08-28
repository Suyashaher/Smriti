/**
 * VoiceCommandService — matches spoken transcripts to normalized command IDs.
 *
 * Features:
 * - Exact phrase matching (case-insensitive)
 * - Fuzzy matching with Levenshtein distance for elderly speech tolerance
 * - Language-independent: English and Khasi map to the same command IDs
 */

import type { VoiceCommandId, LocaleCode } from "@/types";
import { COMMAND_REGISTRY, type CommandEntry } from "./commandRegistry";

export interface CommandMatch {
  commandId: VoiceCommandId;
  confidence: number; // 0.0 – 1.0
  matchedPhrase: string;
}

/**
 * Levenshtein distance between two strings.
 * Used for fuzzy matching to tolerate elderly speech variations.
 */
function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

/** Maximum Levenshtein distance to consider a fuzzy match. */
const MAX_FUZZY_DISTANCE = 3;

export class VoiceCommandService {
  /**
   * Match a transcript string to a command.
   * Returns the best match or null if no command matches.
   */
  matchCommand(transcript: string, locale: LocaleCode): CommandMatch | null {
    const normalized = transcript.toLowerCase().trim();
    if (!normalized) return null;

    const registry = COMMAND_REGISTRY[locale] ?? COMMAND_REGISTRY.en;

    // 1. Try exact match first
    for (const entry of registry) {
      for (const phrase of entry.phrases) {
        if (normalized === phrase) {
          return { commandId: entry.commandId, confidence: 1.0, matchedPhrase: phrase };
        }
      }
    }

    // 2. Try "contains" match (transcript contains a command phrase)
    for (const entry of registry) {
      for (const phrase of entry.phrases) {
        if (normalized.includes(phrase)) {
          return { commandId: entry.commandId, confidence: 0.85, matchedPhrase: phrase };
        }
      }
    }

    // 3. Fuzzy match with Levenshtein distance
    let bestMatch: CommandMatch | null = null;
    let bestDistance = Infinity;

    for (const entry of registry) {
      for (const phrase of entry.phrases) {
        const distance = levenshtein(normalized, phrase);
        if (distance <= MAX_FUZZY_DISTANCE && distance < bestDistance) {
          bestDistance = distance;
          const maxLen = Math.max(normalized.length, phrase.length);
          const confidence = maxLen > 0 ? Math.max(0, 1 - distance / maxLen) : 0;
          bestMatch = { commandId: entry.commandId, confidence, matchedPhrase: phrase };
        }
      }
    }

    return bestMatch;
  }

  /** Get all available commands for a locale (for help display). */
  getAvailableCommands(locale: LocaleCode): CommandEntry[] {
    return COMMAND_REGISTRY[locale] ?? COMMAND_REGISTRY.en;
  }
}
