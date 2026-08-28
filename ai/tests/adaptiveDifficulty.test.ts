import { describe, expect, it } from "vitest";
import { recommendDifficulty } from "../cognitive_engine/adaptiveDifficulty";
import {
  activityTrend,
  classifyResponseTime,
  cognitivePerformanceScore,
  consistencyFromAccuracies,
} from "../cognitive_engine/performanceAnalyzer";
import type { GameSessionInput } from "../cognitive_engine/types";

function sessions(accuracies: number[], extras?: Partial<GameSessionInput>): GameSessionInput[] {
  return accuracies.map((accuracy, index) => ({
    gameId: "memory_cards",
    accuracy,
    score: Math.round(accuracy * 10),
    responseTime: extras?.responseTime ?? 10,
    attempts: extras?.attempts ?? 5,
    completed: extras?.completed ?? true,
    difficulty: extras?.difficulty ?? 2,
    timestamp: `2026-01-0${index + 1}T12:00:00.000Z`,
  }));
}

describe("adaptive difficulty rules", () => {
  it("increases difficulty after consistent high accuracy (case 1)", () => {
    const out = recommendDifficulty({
      gameId: "memory_cards",
      currentDifficulty: 2,
      recentResults: sessions([0.9, 0.88, 0.92]),
    });
    expect(out.nextDifficulty).toBe(3);
    expect(out.recommendation).toBe("ready_challenge");
  });

  it("decreases difficulty after consistent low accuracy (case 2)", () => {
    const out = recommendDifficulty({
      gameId: "memory_cards",
      currentDifficulty: 2,
      recentResults: sessions([0.5, 0.55, 0.48]),
    });
    expect(out.nextDifficulty).toBe(1);
    expect(out.recommendation).toBe("reassure");
  });

  it("keeps difficulty for mid-range accuracy (case 3)", () => {
    const out = recommendDifficulty({
      gameId: "memory_cards",
      currentDifficulty: 2,
      recentResults: sessions([0.7, 0.75, 0.68]),
    });
    expect(out.nextDifficulty).toBe(2);
  });

  it("does not go below 1 (case 4)", () => {
    const out = recommendDifficulty({
      gameId: "memory_cards",
      currentDifficulty: 1,
      recentResults: sessions([0.5, 0.55, 0.48]),
    });
    expect(out.nextDifficulty).toBe(1);
  });

  it("does not go above 3 (case 5)", () => {
    const out = recommendDifficulty({
      gameId: "memory_cards",
      currentDifficulty: 3,
      recentResults: sessions([0.9, 0.88, 0.92]),
    });
    expect(out.nextDifficulty).toBe(3);
  });

  it("decreases after repeated incomplete sessions", () => {
    const out = recommendDifficulty({
      gameId: "memory_cards",
      currentDifficulty: 2,
      recentResults: sessions([0.7, 0.72, 0.71], { completed: false }),
    });
    expect(out.nextDifficulty).toBe(1);
  });

  it("does not change difficulty from a single bad result", () => {
    const out = recommendDifficulty({
      gameId: "memory_cards",
      currentDifficulty: 2,
      recentResults: sessions([0.4]),
    });
    expect(out.nextDifficulty).toBe(2);
    expect(out.reason).toMatch(/Fewer than 3/i);
  });

  it("does not increase when mean accuracy is high but consistency is low", () => {
    const out = recommendDifficulty({
      gameId: "memory_cards",
      currentDifficulty: 2,
      recentResults: sessions([1, 0.55, 1]),
    });
    expect(out.nextDifficulty).toBe(2);
  });

  it("tracks games independently", () => {
    const mixed: GameSessionInput[] = [
      ...sessions([0.9, 0.88, 0.92]),
      ...sessions([0.5, 0.55, 0.48]).map((row) => ({ ...row, gameId: "attention" as const })),
    ];
    const memory = recommendDifficulty({
      gameId: "memory_cards",
      currentDifficulty: 2,
      recentResults: mixed,
    });
    const attention = recommendDifficulty({
      gameId: "attention",
      currentDifficulty: 2,
      recentResults: mixed,
    });
    expect(memory.nextDifficulty).toBe(3);
    expect(attention.nextDifficulty).toBe(1);
  });
});

describe("consistency and scores", () => {
  it("rates tight accuracies as high consistency", () => {
    expect(consistencyFromAccuracies([0.9, 0.88, 0.92])).toBeGreaterThanOrEqual(0.7);
  });

  it("rates mixed accuracies as low consistency", () => {
    expect(consistencyFromAccuracies([0.95, 0.5, 0.9])).toBeLessThan(0.7);
  });

  it("computes a 0–100 Cognitive Performance Score from configurable weights", () => {
    const score = cognitivePerformanceScore({
      meanAccuracy: 0.8,
      completionRate: 1,
      responsePerformance: 0.7,
      consistency: 0.8,
    });
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
    expect(score).toBe(Math.round(100 * (0.5 * 0.8 + 0.2 * 1 + 0.15 * 0.7 + 0.15 * 0.8)));
  });
});

describe("response-time normalization", () => {
  it("classifies per game and does not use a global cutoff", () => {
    expect(classifyResponseTime("memory_cards", 7)).toBe("fast");
    expect(classifyResponseTime("memory_cards", 15)).toBe("normal");
    expect(classifyResponseTime("memory_cards", 30)).toBe("slow");
    expect(classifyResponseTime("object_recognition", 7)).toBe("normal");
  });
});

describe("activity trend", () => {
  it("returns insufficient_data below 3 sessions", () => {
    expect(activityTrend([0.9, 0.8])).toBe("insufficient_data");
  });

  it("detects improving, stable, and declining activity trends", () => {
    expect(activityTrend([0.5, 0.55, 0.8, 0.85])).toBe("improving");
    expect(activityTrend([0.7, 0.72, 0.71, 0.73])).toBe("stable");
    expect(activityTrend([0.9, 0.85, 0.5, 0.45])).toBe("declining");
  });
});
