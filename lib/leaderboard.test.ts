import { describe, expect, test } from "vitest";
import type { Prediction } from "@/types/prediction";
import { computeLeaderboard } from "./leaderboard";

function row(
  source: string,
  outcome: Prediction["outcome"],
  id: string,
): Prediction {
  return {
    id,
    source,
    sourceSlug: source.toLowerCase().replace(/\s+/g, "-"),
    text: "t",
    category: null,
    created_at: "2026-01-01T00:00:00.000Z",
    target_date: null,
    outcome,
  };
}

describe("computeLeaderboard", () => {
  test("given mixed sources, should rank by accuracy then volume", () => {
    const rows = computeLeaderboard(
      [
        row("A", "correct", "1"),
        row("A", "incorrect", "2"),
        row("B", "correct", "3"),
        row("B", "correct", "4"),
        row("B", "incorrect", "5"),
        row("C", "pending", "6"),
      ],
      10,
    );

    expect(rows.map((r) => r.source)).toEqual(["B", "A", "C"]);
    expect(rows[0]).toMatchObject({
      rank: 1,
      source: "B",
      accuracyPercent: 66.7,
      total: 3,
    });
    expect(rows[1]).toMatchObject({
      rank: 2,
      source: "A",
      accuracyPercent: 50,
      total: 2,
    });
    expect(rows[2]).toMatchObject({
      rank: 3,
      source: "C",
      accuracyPercent: null,
      total: 1,
    });
  });

  test("given limit, should cap rows", () => {
    const rows = computeLeaderboard(
      [
        row("X", "correct", "1"),
        row("Y", "correct", "2"),
        row("Z", "correct", "3"),
      ],
      2,
    );
    expect(rows).toHaveLength(2);
  });
});
