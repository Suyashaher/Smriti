import "fake-indexeddb/auto";
import { afterEach, describe, expect, it } from "vitest";
import { db } from "@/db/database";
import { initDatabase } from "@/db/init";
import { buildGameResult } from "@/games/scoring";
import { saveResultAndAdapt } from "@/services/adaptivePlay";
import { getPatientPerformance } from "@/services/patientPerformance";

const PATIENT = "demo-patient-local";

describe("getPatientPerformance", () => {
  afterEach(async () => {
    await db.delete();
  });

  it("returns insufficient_data and default difficulty with no sessions", async () => {
    await initDatabase("en");
    const summary = await getPatientPerformance(PATIENT);
    expect(summary.overallScore).toBe(0);
    expect(summary.gamesPlayed).toBe(0);
    expect(summary.recentTrend).toBe("insufficient_data");
    expect(summary.gamePerformance.memoryCards.difficulty).toBe(2);
    expect(summary.gamePerformance.attention.difficulty).toBe(2);
  });

  it("returns positive overallScore after multiple sessions", async () => {
    await initDatabase("en");
    for (let i = 0; i < 5; i += 1) {
      await saveResultAndAdapt(
        buildGameResult({
          patientId: PATIENT,
          gameId: "memory_cards",
          score: 7,
          correct: 7,
          attempts: 8,
          responseTime: 9,
          difficulty: 2,
          completed: true,
        }),
      );
    }
    const summary = await getPatientPerformance(PATIENT);
    expect(summary.overallScore).toBeGreaterThan(0);
    expect(summary.gamesPlayed).toBe(5);
    expect(summary.gamePerformance.memoryCards.sessions).toBe(5);
    expect(summary.gamePerformance.memoryCards.performanceScore).toBeGreaterThan(0);
  });

  it("calculates per-game trends independently", async () => {
    await initDatabase("en");
    // Improving memory_cards: low → high accuracy
    const lowAccuracies = [0.4, 0.45, 0.5];
    const highAccuracies = [0.85, 0.9];
    for (const acc of [...lowAccuracies, ...highAccuracies]) {
      await saveResultAndAdapt(
        buildGameResult({
          patientId: PATIENT,
          gameId: "memory_cards",
          score: Math.round(acc * 8),
          correct: Math.round(acc * 8),
          attempts: 8,
          responseTime: 10,
          difficulty: 2,
          completed: true,
        }),
      );
    }
    // Steady attention: all similar
    for (let i = 0; i < 3; i += 1) {
      await saveResultAndAdapt(
        buildGameResult({
          patientId: PATIENT,
          gameId: "attention",
          score: 5,
          correct: 5,
          attempts: 7,
          responseTime: 12,
          difficulty: 2,
          completed: true,
        }),
      );
    }
    const summary = await getPatientPerformance(PATIENT);
    expect(summary.gamePerformance.memoryCards.trend).toBe("improving");
    expect(summary.gamePerformance.attention.trend).toBe("stable");
    // Games without sessions
    expect(summary.gamePerformance.patternRecognition.trend).toBe("insufficient_data");
  });

  it("keeps game slices independent — one game does not affect another", async () => {
    await initDatabase("en");
    for (let i = 0; i < 3; i += 1) {
      await saveResultAndAdapt(
        buildGameResult({
          patientId: PATIENT,
          gameId: "pattern_recognition",
          score: 4,
          correct: 4,
          attempts: 4,
          responseTime: 5,
          difficulty: 2,
          completed: true,
        }),
      );
    }
    const summary = await getPatientPerformance(PATIENT);
    expect(summary.gamePerformance.patternRecognition.sessions).toBe(3);
    expect(summary.gamePerformance.memoryCards.sessions).toBe(0);
    expect(summary.gamePerformance.attention.sessions).toBe(0);
    expect(summary.gamePerformance.objectRecognition.sessions).toBe(0);
    expect(summary.gamePerformance.routineRecall.sessions).toBe(0);
  });

  it("uses only non-clinical trend labels", async () => {
    await initDatabase("en");
    const summary = await getPatientPerformance(PATIENT);
    const validTrends = ["improving", "stable", "declining", "insufficient_data"];
    expect(validTrends).toContain(summary.recentTrend);
    for (const slice of Object.values(summary.gamePerformance)) {
      expect(validTrends).toContain(slice.trend);
    }
  });
});
