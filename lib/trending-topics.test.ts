import { describe, expect, test } from "vitest";
import type { Prediction } from "@/types/prediction";
import { rankTrendingTopics, topicTabFromCategory } from "./trending-topics";

function row(
  category: string | null,
  created_at: string,
): Prediction {
  return {
    id: "x",
    source: "S",
    sourceSlug: "s",
    text: "t",
    category,
    created_at,
    resolved_at: null,
    target_date: null,
    outcome: "pending",
  };
}

describe("topicTabFromCategory", () => {
  test("maps known categories case-insensitively", () => {
    expect(topicTabFromCategory("economics")).toBe("Economics");
    expect(topicTabFromCategory("TECH")).toBe("Tech");
  });

  test("returns null for unknown or empty", () => {
    expect(topicTabFromCategory("Weather")).toBeNull();
    expect(topicTabFromCategory(null)).toBeNull();
  });
});

describe("rankTrendingTopics", () => {
  const now = Date.parse("2024-06-15T12:00:00.000Z");

  test("ranks by recent count then total count", () => {
    const predictions = [
      row("Tech", "2024-06-14T00:00:00.000Z"),
      row("Tech", "2024-06-13T00:00:00.000Z"),
      row("Economics", "2024-06-14T00:00:00.000Z"),
      row("Economics", "2024-01-01T00:00:00.000Z"),
      row("Economics", "2024-01-02T00:00:00.000Z"),
      row("Economics", "2024-01-03T00:00:00.000Z"),
    ];

    const ranked = rankTrendingTopics(predictions, { now });
    expect(ranked[0]?.topic).toBe("Tech");
    expect(ranked[0]?.recentCount).toBe(2);
    expect(ranked[1]?.topic).toBe("Economics");
    expect(ranked[1]?.recentCount).toBe(1);
    expect(ranked[1]?.count).toBe(4);
  });

  test("ignores null and unknown categories", () => {
    const ranked = rankTrendingTopics(
      [row(null, "2024-06-14T00:00:00.000Z"), row("Mystery", "2024-06-14T00:00:00.000Z")],
      { now },
    );
    expect(ranked).toHaveLength(0);
  });
});
