import { describe, expect, test } from "vitest";
import type { Prediction } from "@/types/prediction";
import { computeTopInsight } from "./insights";

let nextId = 0;

function row(
  source: string,
  outcome: Prediction["outcome"],
  options: {
    category?: string | null;
    created_at?: string;
  } = {},
): Prediction {
  nextId += 1;
  const created_at = options.created_at ?? "2026-01-01T00:00:00.000Z";
  return {
    id: `id-${nextId}`,
    source,
    sourceSlug: source.toLowerCase().replace(/\s+/g, "-"),
    text: "t",
    category: options.category ?? null,
    created_at,
    resolved_at: outcome === "pending" ? null : created_at,
    target_date: null,
    outcome,
  };
}

describe("computeTopInsight", () => {
  test("given empty list, should return null", () => {
    expect(computeTopInsight([])).toBeNull();
  });

  test("given a perfect-record source with enough resolved, fires top_accuracy", () => {
    const insight = computeTopInsight([
      row("Jane Analyst", "correct"),
      row("Jane Analyst", "correct"),
      row("Tech Blogger", "incorrect"),
    ]);
    expect(insight).toMatchObject({
      kind: "top_accuracy",
      source: "Jane Analyst",
      correct: 2,
      scored: 2,
    });
    expect(insight!.headline).toBe(
      "Jane Analyst has been correct on 2/2 scored predictions.",
    );
  });

  test("given a perfect record with only one resolved, does not fire top_accuracy", () => {
    const insight = computeTopInsight([
      row("Jane Analyst", "correct"),
      row("Jane Analyst", "pending"),
      row("Tech Blogger", "pending"),
    ]);
    expect(insight?.kind).not.toBe("top_accuracy");
  });

  test("given a 3+ correct streak with no perfect record, fires hot_streak", () => {
    const insight = computeTopInsight([
      row("Streaker", "incorrect", { created_at: "2026-01-01T00:00:00.000Z" }),
      row("Streaker", "correct", { created_at: "2026-01-02T00:00:00.000Z" }),
      row("Streaker", "correct", { created_at: "2026-01-03T00:00:00.000Z" }),
      row("Streaker", "correct", { created_at: "2026-01-04T00:00:00.000Z" }),
    ]);
    expect(insight).toMatchObject({
      kind: "hot_streak",
      source: "Streaker",
      length: 3,
    });
    expect(insight!.headline).toBe(
      "Streaker is on a 3-prediction correct streak.",
    );
  });

  test("given a 2-correct streak (below threshold), should not fire hot_streak", () => {
    const insight = computeTopInsight([
      row("Streaker", "incorrect", { created_at: "2026-01-01T00:00:00.000Z" }),
      row("Streaker", "correct", { created_at: "2026-01-02T00:00:00.000Z" }),
      row("Streaker", "correct", { created_at: "2026-01-03T00:00:00.000Z" }),
    ]);
    expect(insight?.kind).not.toBe("hot_streak");
  });

  test("given a 2+ incorrect streak with no hot streak, fires cold_streak", () => {
    const insight = computeTopInsight([
      row("Cold", "correct", { created_at: "2026-01-01T00:00:00.000Z" }),
      row("Cold", "incorrect", { created_at: "2026-01-02T00:00:00.000Z" }),
      row("Cold", "incorrect", { created_at: "2026-01-03T00:00:00.000Z" }),
    ]);
    expect(insight).toMatchObject({
      kind: "cold_streak",
      source: "Cold",
      length: 2,
    });
    expect(insight!.headline).toBe(
      "Cold has been incorrect on their last 2 predictions.",
    );
  });

  test("given category accuracy gap >= 25 points, fires category_gap", () => {
    const insight = computeTopInsight([
      row("A", "correct", { category: "Economics" }),
      row("A", "correct", { category: "Economics" }),
      row("A", "correct", { category: "Economics" }),
      row("A", "incorrect", { category: "Economics" }),
      row("B", "incorrect", { category: "Tech" }),
      row("B", "incorrect", { category: "Tech" }),
      row("B", "correct", { category: "Tech" }),
      row("B", "pending", { category: "Tech" }),
    ]);
    expect(insight).toMatchObject({
      kind: "category_gap",
      topCategory: "Economics",
      bottomCategory: "Tech",
    });
    expect(insight!.headline).toBe(
      "Predictions in Economics are more accurate than Tech (75% vs 33%).",
    );
  });

  test("given category gap below threshold, does not fire category_gap", () => {
    const insight = computeTopInsight([
      row("A", "correct", { category: "X" }),
      row("A", "correct", { category: "X" }),
      row("A", "incorrect", { category: "X" }),
      row("B", "correct", { category: "Y" }),
      row("B", "correct", { category: "Y" }),
      row("B", "incorrect", { category: "Y" }),
    ]);
    expect(insight?.kind).not.toBe("category_gap");
  });

  test("given >=60% pending and >=5 total, fires unresolved_majority as fallback", () => {
    const insight = computeTopInsight([
      row("S", "pending"),
      row("S", "pending"),
      row("S", "pending"),
      row("S", "correct"),
      row("S", "incorrect"),
    ]);
    expect(insight).toMatchObject({
      kind: "unresolved_majority",
      pendingPercent: 60,
    });
    expect(insight!.headline).toBe(
      "Most predictions (60%) are still pending resolution.",
    );
  });

  test("given perfect record AND a hot streak, top_accuracy wins (priority)", () => {
    const insight = computeTopInsight([
      row("Perfect", "correct", { created_at: "2026-01-01T00:00:00.000Z" }),
      row("Perfect", "correct", { created_at: "2026-01-02T00:00:00.000Z" }),
      row("Perfect", "correct", { created_at: "2026-01-03T00:00:00.000Z" }),
      row("Perfect", "correct", { created_at: "2026-01-04T00:00:00.000Z" }),
    ]);
    expect(insight?.kind).toBe("top_accuracy");
  });

  test("given a hot streak AND a cold streak, hot_streak wins (priority)", () => {
    const insight = computeTopInsight([
      row("Hot", "incorrect", { created_at: "2025-12-01T00:00:00.000Z" }),
      row("Hot", "correct", { created_at: "2026-01-01T00:00:00.000Z" }),
      row("Hot", "correct", { created_at: "2026-01-02T00:00:00.000Z" }),
      row("Hot", "correct", { created_at: "2026-01-03T00:00:00.000Z" }),
      row("Cold", "incorrect", { created_at: "2026-01-04T00:00:00.000Z" }),
      row("Cold", "incorrect", { created_at: "2026-01-05T00:00:00.000Z" }),
    ]);
    expect(insight?.kind).toBe("hot_streak");
    expect((insight as { source: string }).source).toBe("Hot");
  });

  test("given multiple hot streaks, picks the longest", () => {
    const insight = computeTopInsight([
      row("Short", "incorrect", { created_at: "2025-11-01T00:00:00.000Z" }),
      row("Short", "correct", { created_at: "2026-01-01T00:00:00.000Z" }),
      row("Short", "correct", { created_at: "2026-01-02T00:00:00.000Z" }),
      row("Short", "correct", { created_at: "2026-01-03T00:00:00.000Z" }),
      row("Long", "incorrect", { created_at: "2025-11-01T00:00:00.000Z" }),
      row("Long", "correct", { created_at: "2026-02-01T00:00:00.000Z" }),
      row("Long", "correct", { created_at: "2026-02-02T00:00:00.000Z" }),
      row("Long", "correct", { created_at: "2026-02-03T00:00:00.000Z" }),
      row("Long", "correct", { created_at: "2026-02-04T00:00:00.000Z" }),
    ]);
    expect(insight).toMatchObject({
      kind: "hot_streak",
      source: "Long",
      length: 4,
    });
  });

  test("given tied hot streak length, picks better leaderboard rank", () => {
    const insight = computeTopInsight([
      row("Alpha", "incorrect", { created_at: "2026-01-01T00:00:00.000Z" }),
      row("Alpha", "correct", { created_at: "2026-01-02T00:00:00.000Z" }),
      row("Alpha", "correct", { created_at: "2026-01-03T00:00:00.000Z" }),
      row("Alpha", "correct", { created_at: "2026-01-04T00:00:00.000Z" }),
      row("Beta", "incorrect", { created_at: "2026-01-01T00:00:00.000Z" }),
      row("Beta", "incorrect", { created_at: "2026-01-02T00:00:00.000Z" }),
      row("Beta", "correct", { created_at: "2026-01-03T00:00:00.000Z" }),
      row("Beta", "correct", { created_at: "2026-01-04T00:00:00.000Z" }),
      row("Beta", "correct", { created_at: "2026-01-05T00:00:00.000Z" }),
    ]);
    expect(insight).toMatchObject({
      kind: "hot_streak",
      source: "Alpha",
      length: 3,
    });
  });

  test("given no rules trigger, returns null", () => {
    const insight = computeTopInsight([
      row("A", "correct"),
      row("A", "incorrect"),
      row("B", "correct"),
      row("B", "incorrect"),
    ]);
    expect(insight).toBeNull();
  });
});
