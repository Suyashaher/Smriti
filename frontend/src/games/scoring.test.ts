import { describe, expect, it } from "vitest";
import { buildGameResult, computeAccuracy, meanResponseTimeSeconds, shuffle } from "@/games/scoring";
import { itemCountForDifficulty } from "@/games/types";

describe("scoring", () => {
  it("computes accuracy as a 0–1 ratio", () => {
    expect(computeAccuracy(8, 10)).toBe(0.8);
    expect(computeAccuracy(0, 0)).toBe(0);
  });

  it("averages response times", () => {
    expect(meanResponseTimeSeconds([2, 4, 3])).toBe(3);
  });

  it("builds a GameResult with synced false", () => {
    const result = buildGameResult({
      patientId: "demo-patient-local",
      gameId: "memory_cards",
      score: 4,
      correct: 4,
      attempts: 5,
      responseTime: 6.2,
      difficulty: 2,
      completed: true,
    });
    expect(result.accuracy).toBe(0.8);
    expect(result.synced).toBe(false);
    expect(result.id.length).toBeGreaterThan(8);
    expect(result.timestamp).toMatch(/T/);
  });

  it("maps difficulty to 3, 5, or 8 items", () => {
    expect(itemCountForDifficulty(1)).toBe(3);
    expect(itemCountForDifficulty(2)).toBe(5);
    expect(itemCountForDifficulty(3)).toBe(8);
  });

  it("shuffles without dropping items", () => {
    const items = [1, 2, 3, 4];
    expect(shuffle(items).sort()).toEqual(items);
  });
});
