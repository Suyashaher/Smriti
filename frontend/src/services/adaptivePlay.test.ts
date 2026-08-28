import "fake-indexeddb/auto";
import { afterEach, describe, expect, it } from "vitest";
import { db } from "@/db/database";
import { getGameDifficulty } from "@/db/gameDifficulty";
import { listGameResultsForGame } from "@/db/gameResults";
import { initDatabase } from "@/db/init";
import { buildGameResult } from "@/games/scoring";
import { saveResultAndAdapt, toSessionInput } from "@/services/adaptivePlay";

const PATIENT = "demo-patient-local";

describe("saveResultAndAdapt integration", () => {
  afterEach(async () => {
    await db.delete();
  });

  it("increases difficulty after 3 high-accuracy sessions", async () => {
    await initDatabase("en");
    for (let i = 0; i < 3; i += 1) {
      await saveResultAndAdapt(
        buildGameResult({
          patientId: PATIENT,
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
    const record = await getGameDifficulty(PATIENT, "memory_cards");
    expect(record.currentDifficulty).toBe(3);
    expect(record.performanceScore).toBeGreaterThan(0);
  });

  it("decreases difficulty after 3 low-accuracy sessions", async () => {
    await initDatabase("en");
    for (let i = 0; i < 3; i += 1) {
      await saveResultAndAdapt(
        buildGameResult({
          patientId: PATIENT,
          gameId: "attention",
          score: 1,
          correct: 1,
          attempts: 5,
          responseTime: 30,
          difficulty: 2,
          completed: true,
        }),
      );
    }
    const record = await getGameDifficulty(PATIENT, "attention");
    expect(record.currentDifficulty).toBe(1);
  });

  it("keeps difficulty stable for mid-range accuracy", async () => {
    await initDatabase("en");
    for (let i = 0; i < 3; i += 1) {
      await saveResultAndAdapt(
        buildGameResult({
          patientId: PATIENT,
          gameId: "pattern_recognition",
          score: 3,
          correct: 3,
          attempts: 4,
          responseTime: 8,
          difficulty: 2,
          completed: true,
        }),
      );
    }
    const record = await getGameDifficulty(PATIENT, "pattern_recognition");
    expect(record.currentDifficulty).toBe(2);
  });

  it("does not change difficulty from a single session", async () => {
    await initDatabase("en");
    const { adaptation } = await saveResultAndAdapt(
      buildGameResult({
        patientId: PATIENT,
        gameId: "object_recognition",
        score: 0,
        correct: 0,
        attempts: 3,
        responseTime: 15,
        difficulty: 2,
        completed: false,
      }),
    );
    expect(adaptation.nextDifficulty).toBe(2);
    expect(adaptation.reason).toMatch(/fewer than 3/i);
  });

  it("persists game result to IndexedDB with sync queue entry", async () => {
    await initDatabase("en");
    const result = buildGameResult({
      patientId: PATIENT,
      gameId: "memory_cards",
      score: 5,
      correct: 5,
      attempts: 5,
      responseTime: 6,
      difficulty: 2,
      completed: true,
    });
    const { stored } = await saveResultAndAdapt(result);
    expect(stored.synced).toBe(false);
    const inDb = await db.gameResults.get(stored.id);
    expect(inDb?.gameId).toBe("memory_cards");
    const queueItem = await db.syncQueue.where("entityId").equals(result.id).first();
    expect(queueItem).toBeDefined();
    expect(queueItem?.entityType).toBe("GAME_RESULT");
    expect(queueItem?.status).toBe("PENDING");
  });

  it("returns adaptation with recommendation and confidence", async () => {
    await initDatabase("en");
    const { adaptation } = await saveResultAndAdapt(
      buildGameResult({
        patientId: PATIENT,
        gameId: "daily_routine_recall",
        score: 3,
        correct: 3,
        attempts: 3,
        responseTime: 5,
        difficulty: 2,
        completed: true,
      }),
    );
    expect(adaptation.nextDifficulty).toBeGreaterThanOrEqual(1);
    expect(adaptation.nextDifficulty).toBeLessThanOrEqual(3);
    expect(adaptation.recommendation).toBeDefined();
    expect(adaptation.confidence).toBeGreaterThan(0);
    expect(adaptation.reason.length).toBeGreaterThan(0);
  });

  it("keeps game difficulties independent across games", async () => {
    await initDatabase("en");
    // 3 high-accuracy memory_cards sessions → increase
    for (let i = 0; i < 3; i += 1) {
      await saveResultAndAdapt(
        buildGameResult({
          patientId: PATIENT,
          gameId: "memory_cards",
          score: 8,
          correct: 8,
          attempts: 8,
          responseTime: 6,
          difficulty: 2,
          completed: true,
        }),
      );
    }
    // 3 low-accuracy attention sessions → decrease
    for (let i = 0; i < 3; i += 1) {
      await saveResultAndAdapt(
        buildGameResult({
          patientId: PATIENT,
          gameId: "attention",
          score: 1,
          correct: 1,
          attempts: 8,
          responseTime: 30,
          difficulty: 2,
          completed: true,
        }),
      );
    }
    const memory = await getGameDifficulty(PATIENT, "memory_cards");
    const attention = await getGameDifficulty(PATIENT, "attention");
    expect(memory.currentDifficulty).toBe(3);
    expect(attention.currentDifficulty).toBe(1);
  });

  it("stores results retrievable by listGameResultsForGame", async () => {
    await initDatabase("en");
    for (let i = 0; i < 4; i += 1) {
      await saveResultAndAdapt(
        buildGameResult({
          patientId: PATIENT,
          gameId: "memory_cards",
          score: i + 1,
          correct: i + 1,
          attempts: 5,
          responseTime: 10,
          difficulty: 2,
          completed: true,
        }),
      );
    }
    const results = await listGameResultsForGame(PATIENT, "memory_cards", 5);
    expect(results.length).toBe(4);
    // Most recent first
    expect(results[0]!.score).toBe(4);
  });
});

describe("toSessionInput", () => {
  it("maps GameResult fields to GameSessionInput", () => {
    const result = buildGameResult({
      patientId: PATIENT,
      gameId: "attention",
      score: 3,
      correct: 3,
      attempts: 5,
      responseTime: 12.5,
      difficulty: 2,
      completed: true,
    });
    const session = toSessionInput(result);
    expect(session.gameId).toBe("attention");
    expect(session.accuracy).toBe(result.accuracy);
    expect(session.score).toBe(3);
    expect(session.responseTime).toBe(12.5);
    expect(session.attempts).toBe(5);
    expect(session.completed).toBe(true);
    expect(session.difficulty).toBe(2);
    expect(session.timestamp).toBe(result.timestamp);
    // Should NOT have id, patientId, or synced
    expect("id" in session).toBe(false);
    expect("patientId" in session).toBe(false);
    expect("synced" in session).toBe(false);
  });
});
