import { describe, expect, test } from "vitest";
import type { Prediction } from "@/types/prediction";
import {
  buildAccuracyOverTime,
  buildOutcomeSplit,
  buildPerSourceCounts,
} from "./chart-data";

function prediction(overrides: Partial<Prediction> = {}): Prediction {
  return {
    id: "p1",
    source: "Jane Analyst",
    sourceSlug: "jane-analyst",
    text: "Example",
    category: null,
    created_at: "2026-01-10T00:00:00.000Z",
    target_date: null,
    outcome: "pending",
    ...overrides,
  };
}

describe("buildAccuracyOverTime", () => {
  test("given mixed resolved outcomes by month, should return sorted monthly accuracy", () => {
    const result = buildAccuracyOverTime([
      prediction({ id: "a", created_at: "2026-03-15T12:00:00.000Z", outcome: "correct" }),
      prediction({ id: "b", created_at: "2026-03-20T12:00:00.000Z", outcome: "incorrect" }),
      prediction({ id: "c", created_at: "2026-01-15T12:00:00.000Z", outcome: "correct" }),
      prediction({ id: "d", created_at: "bad-date", outcome: "correct" }),
      prediction({ id: "e", created_at: "2026-03-25T12:00:00.000Z", outcome: "pending" }),
    ]);

    expect(result).toEqual([
      { month: "2026-01", accuracy: 100 },
      { month: "2026-03", accuracy: 50 },
    ]);
  });

  test("given only pending predictions, should return empty series", () => {
    const result = buildAccuracyOverTime([
      prediction({ id: "a", outcome: "pending" }),
      prediction({ id: "b", outcome: "pending", created_at: "2026-02-01T00:00:00.000Z" }),
    ]);

    expect(result).toEqual([]);
  });

  test("given timestamps around month boundaries, should bucket using UTC month", () => {
    const result = buildAccuracyOverTime([
      prediction({
        id: "a",
        created_at: "2026-03-01T00:30:00.000Z",
        outcome: "correct",
      }),
      prediction({
        id: "b",
        created_at: "2026-02-28T23:30:00.000Z",
        outcome: "incorrect",
      }),
    ]);

    expect(result).toEqual([
      { month: "2026-02", accuracy: 0 },
      { month: "2026-03", accuracy: 100 },
    ]);
  });
});

describe("buildPerSourceCounts", () => {
  test("given multiple sources, should aggregate and sort descending by count", () => {
    const result = buildPerSourceCounts([
      prediction({ id: "a", source: "Jane Analyst" }),
      prediction({ id: "b", source: "Tech Blogger" }),
      prediction({ id: "c", source: "Jane Analyst" }),
      prediction({ id: "d", source: "Macro Desk" }),
      prediction({ id: "e", source: "Jane Analyst" }),
      prediction({ id: "f", source: "Tech Blogger" }),
    ]);

    expect(result).toEqual([
      { source: "Jane Analyst", count: 3 },
      { source: "Tech Blogger", count: 2 },
      { source: "Macro Desk", count: 1 },
    ]);
  });
});

describe("buildOutcomeSplit", () => {
  test("given non-zero outcome counts, should return only slices with values", () => {
    const result = buildOutcomeSplit([
      prediction({ id: "a", outcome: "correct" }),
      prediction({ id: "b", outcome: "correct" }),
      prediction({ id: "c", outcome: "incorrect" }),
    ]);

    expect(result).toEqual([
      { name: "Correct", value: 2, fill: "#059669" },
      { name: "Incorrect", value: 1, fill: "#dc2626" },
    ]);
  });

  test("given empty predictions, should return no slices", () => {
    expect(buildOutcomeSplit([])).toEqual([]);
  });
});
