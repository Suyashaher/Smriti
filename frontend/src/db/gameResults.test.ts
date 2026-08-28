import "fake-indexeddb/auto";
import { afterEach, describe, expect, it } from "vitest";
import { db } from "@/db/database";
import { saveGameResult } from "@/db/gameResults";
import { initDatabase } from "@/db/init";
import { buildGameResult } from "@/games/scoring";

describe("game result IndexedDB persistence", () => {
  afterEach(async () => {
    await db.delete();
  });

  it("saves a result and keeps it after reopening the database", async () => {
    await initDatabase("en");
    const result = buildGameResult({
      patientId: "demo-patient-local",
      gameId: "memory_cards",
      score: 5,
      correct: 5,
      attempts: 5,
      responseTime: 4.1,
      difficulty: 2,
      completed: true,
    });

    await saveGameResult(result);
    const name = db.name;
    db.close();
    await db.open();
    expect(db.name).toBe(name);

    const stored = await db.gameResults.get(result.id);
    expect(stored?.score).toBe(5);
    expect(stored?.synced).toBe(false);
    expect(stored?.gameId).toBe("memory_cards");

    const queueItem = await db.syncQueue.where("entityId").equals(result.id).first();
    expect(queueItem).toBeDefined();
    expect(queueItem?.entityType).toBe("GAME_RESULT");
    expect(queueItem?.status).toBe("PENDING");
  });
});
