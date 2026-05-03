import { describe, expect, test } from "vitest";
import type { Prediction } from "@/types/prediction";
import { computeSourceAccuracyStats } from "./source-stats";

function row(overrides: Partial<Prediction> = {}): Prediction {
  return {
    id: "1",
    source: "Jane",
    sourceSlug: "jane",
    text: "x",
    category: null,
    created_at: "2024-01-01T00:00:00.000Z",
    resolved_at: null,
    target_date: null,
    outcome: "pending",
    ...overrides,
  };
}

describe("computeSourceAccuracyStats", () => {
  test("given empty list, should use nameFallback", () => {
    expect(computeSourceAccuracyStats([], { nameFallback: "slug" })).toEqual({
      name: "slug",
      total: 0,
      resolved: 0,
      accuracy: null,
    });
  });

  test("given rows, should use first row source as display name", () => {
    const stats = computeSourceAccuracyStats(
      [row({ outcome: "correct" }), row({ id: "2", outcome: "incorrect" })],
      { nameFallback: "ignored" },
    );
    expect(stats.name).toBe("Jane");
    expect(stats.total).toBe(2);
    expect(stats.resolved).toBe(2);
    expect(stats.accuracy).toBe(50);
  });

  test("given primaryName, should prefer over empty list", () => {
    const stats = computeSourceAccuracyStats([], {
      nameFallback: "slug",
      primaryName: "Loaded Name",
    });
    expect(stats.name).toBe("Loaded Name");
  });
});
