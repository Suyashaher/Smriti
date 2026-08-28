import "fake-indexeddb/auto";
import { afterEach, describe, expect, it } from "vitest";
import { db } from "@/db/database";
import { getGameDifficulty } from "@/db/gameDifficulty";
import { initDatabase } from "@/db/init";
import { buildGameResult } from "@/games/scoring";
import { saveResultAndAdapt } from "@/services/adaptivePlay";
import { getPatientPerformance } from "@/services/patientPerformance";

describe("per-game difficulty persistence", () => {
  afterEach(async () => {
    await db.delete();
  });

  it("stores independent difficulties after enough high-accuracy sessions", async () => {
    await initDatabase("en");
    for (let i = 0; i < 3; i += 1) {
      await saveResultAndAdapt(
        buildGameResult({
          patientId: "demo-patient-local",
          gameId: "memory_cards",
          score: 8,
          correct: 8,
          attempts: 8,
          responseTime: 7,
          difficulty: 2,
          completed: true,
        }),
      );
    }
    await saveResultAndAdapt(
      buildGameResult({
        patientId: "demo-patient-local",
        gameId: "attention",
        score: 1,
        correct: 1,
        attempts: 4,
        responseTime: 20,
        difficulty: 2,
        completed: true,
      }),
    );

    const memory = await getGameDifficulty("demo-patient-local", "memory_cards");
    const attention = await getGameDifficulty("demo-patient-local", "attention");
    expect(memory.currentDifficulty).toBe(3);
    expect(attention.currentDifficulty).toBe(2);

    db.close();
    await db.open();
    const memoryAgain = await getGameDifficulty("demo-patient-local", "memory_cards");
    expect(memoryAgain.currentDifficulty).toBe(3);
    expect(memoryAgain.performanceScore).toBeGreaterThan(0);
  });

  it("exposes caregiver performance summary without medical labels", async () => {
    await initDatabase("en");
    const summary = await getPatientPerformance("demo-patient-local");
    expect(summary.gamesPlayed).toBe(0);
    expect(summary.recentTrend).toBe("insufficient_data");
    expect(summary.gamePerformance.memoryCards.difficulty).toBe(2);
  });
});
