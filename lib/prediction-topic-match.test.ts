import { describe, expect, test } from "vitest";
import type { Prediction } from "@/types/prediction";
import { listTopics } from "@/lib/topic-store";
import {
  predictionMatchesCategory,
  predictionMatchesTopicSlug,
} from "./prediction-topic-match";

function base(overrides: Partial<Prediction> = {}): Prediction {
  return {
    id: "1",
    source: "S",
    sourceSlug: "s",
    text: "t",
    category: "Finance",
    topicIds: [],
    created_at: "2024-01-01T00:00:00.000Z",
    resolved_at: null,
    target_date: null,
    outcome: "pending",
    ...overrides,
  };
}

describe("predictionMatchesCategory", () => {
  test("matches explicit category on prediction", () => {
    expect(predictionMatchesCategory(base({ category: "Tech" }), "Tech")).toBe(
      true,
    );
  });

  test("matches via linked topic categories", () => {
    const topics = listTopics();
    const ai = topics.find((t) => t.slug === "ai-regulation-2026");
    expect(ai).toBeDefined();
    expect(
      predictionMatchesCategory(
        base({ category: null, topicIds: [ai!.id] }),
        "Politics",
      ),
    ).toBe(true);
  });
});

describe("predictionMatchesTopicSlug", () => {
  test("given unknown topic slug, should not match", () => {
    expect(predictionMatchesTopicSlug(base(), "not-a-real-topic")).toBe(false);
  });

  test("given linked topic slug, should match", () => {
    const ai = listTopics().find((t) => t.slug === "ai-regulation-2026");
    expect(ai).toBeDefined();
    expect(
      predictionMatchesTopicSlug(
        base({ topicIds: [ai!.id] }),
        "ai-regulation-2026",
      ),
    ).toBe(true);
  });
});
