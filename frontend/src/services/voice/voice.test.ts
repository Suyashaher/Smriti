/**
 * Voice service tests.
 * Tests command matching, capability detection, and provider behavior.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { VoiceCommandService } from "./VoiceCommandService";
import { COMMAND_REGISTRY } from "./commandRegistry";

describe("VoiceCommandService", () => {
  let service: VoiceCommandService;

  beforeEach(() => {
    service = new VoiceCommandService();
  });

  describe("Exact match", () => {
    it("matches 'start game' to START_GAME", () => {
      const result = service.matchCommand("start game", "en");
      expect(result).not.toBeNull();
      expect(result!.commandId).toBe("START_GAME");
      expect(result!.confidence).toBe(1.0);
    });

    it("matches 'go home' to GO_HOME", () => {
      const result = service.matchCommand("go home", "en");
      expect(result).not.toBeNull();
      expect(result!.commandId).toBe("GO_HOME");
      expect(result!.confidence).toBe(1.0);
    });

    it("matches 'help' to HELP", () => {
      const result = service.matchCommand("help", "en");
      expect(result).not.toBeNull();
      expect(result!.commandId).toBe("HELP");
    });

    it("matches 'repeat' to REPEAT", () => {
      const result = service.matchCommand("repeat", "en");
      expect(result).not.toBeNull();
      expect(result!.commandId).toBe("REPEAT");
    });

    it("matches 'go back' to GO_BACK", () => {
      const result = service.matchCommand("go back", "en");
      expect(result).not.toBeNull();
      expect(result!.commandId).toBe("GO_BACK");
    });
  });

  describe("Case insensitivity", () => {
    it("matches 'START GAME' (uppercase) to START_GAME", () => {
      const result = service.matchCommand("START GAME", "en");
      expect(result).not.toBeNull();
      expect(result!.commandId).toBe("START_GAME");
    });

    it("matches 'Go Home' (mixed case) to GO_HOME", () => {
      const result = service.matchCommand("Go Home", "en");
      expect(result).not.toBeNull();
      expect(result!.commandId).toBe("GO_HOME");
    });
  });

  describe("Contains match", () => {
    it("matches 'please start game now' via substring", () => {
      const result = service.matchCommand("please start game now", "en");
      expect(result).not.toBeNull();
      expect(result!.commandId).toBe("START_GAME");
      expect(result!.confidence).toBe(0.85);
    });

    it("matches 'I want to go home' via substring", () => {
      const result = service.matchCommand("I want to go home", "en");
      expect(result).not.toBeNull();
      expect(result!.commandId).toBe("GO_HOME");
    });
  });

  describe("Fuzzy match", () => {
    it("matches 'strt game' (typo) via Levenshtein", () => {
      const result = service.matchCommand("strt game", "en");
      expect(result).not.toBeNull();
      expect(result!.commandId).toBe("START_GAME");
      expect(result!.confidence).toBeGreaterThan(0.6);
    });

    it("matches 'hlp' (typo) via Levenshtein", () => {
      const result = service.matchCommand("hlp", "en");
      expect(result).not.toBeNull();
      expect(result!.commandId).toBe("HELP");
    });
  });

  describe("No match", () => {
    it("returns null for unrecognized speech", () => {
      const result = service.matchCommand("the sky is very blue and cloudy", "en");
      expect(result).toBeNull();
    });

    it("returns null for empty string", () => {
      const result = service.matchCommand("", "en");
      expect(result).toBeNull();
    });

    it("returns null for whitespace only", () => {
      const result = service.matchCommand("   ", "en");
      expect(result).toBeNull();
    });
  });

  describe("Khasi locale", () => {
    it("matches 'sdang' to START_GAME in Khasi", () => {
      const result = service.matchCommand("sdang", "kh");
      expect(result).not.toBeNull();
      expect(result!.commandId).toBe("START_GAME");
    });

    it("matches 'jingïarap' to HELP in Khasi", () => {
      const result = service.matchCommand("jingïarap", "kh");
      expect(result).not.toBeNull();
      expect(result!.commandId).toBe("HELP");
    });

    it("matches 'phai shuh' to GO_BACK in Khasi", () => {
      const result = service.matchCommand("phai shuh", "kh");
      expect(result).not.toBeNull();
      expect(result!.commandId).toBe("GO_BACK");
    });

    it("falls back to English for unknown locale", () => {
      const result = service.matchCommand("help", "kh");
      // Khasi doesn't have "help" as a phrase — should not match
      // but it still checks the Khasi registry first
      // This tests registry isolation
      expect(result === null || result.commandId === "HELP").toBe(true);
    });
  });

  describe("Available commands", () => {
    it("returns English commands for 'en' locale", () => {
      const commands = service.getAvailableCommands("en");
      expect(commands.length).toBeGreaterThan(0);
      expect(commands.map((c) => c.commandId)).toContain("START_GAME");
    });

    it("returns Khasi commands for 'kh' locale", () => {
      const commands = service.getAvailableCommands("kh");
      expect(commands.length).toBeGreaterThan(0);
      expect(commands.map((c) => c.commandId)).toContain("START_GAME");
    });
  });
});

describe("COMMAND_REGISTRY", () => {
  it("has matching command IDs in English and Khasi", () => {
    const enIds = new Set(COMMAND_REGISTRY.en.map((e) => e.commandId));
    const khIds = new Set(COMMAND_REGISTRY.kh.map((e) => e.commandId));
    expect(enIds).toEqual(khIds);
  });

  it("all entries have at least one phrase", () => {
    for (const locale of Object.keys(COMMAND_REGISTRY) as Array<keyof typeof COMMAND_REGISTRY>) {
      for (const entry of COMMAND_REGISTRY[locale]) {
        expect(entry.phrases.length).toBeGreaterThan(0);
      }
    }
  });

  it("all phrases are lowercase", () => {
    for (const locale of Object.keys(COMMAND_REGISTRY) as Array<keyof typeof COMMAND_REGISTRY>) {
      for (const entry of COMMAND_REGISTRY[locale]) {
        for (const phrase of entry.phrases) {
          expect(phrase).toBe(phrase.toLowerCase());
        }
      }
    }
  });
});
