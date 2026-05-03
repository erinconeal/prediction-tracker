import { describe, expect, test } from "vitest";
import type { Prediction } from "@/types/prediction";
import {
  DEFAULT_MAX_FEATURED_SLIDES,
  pickFeaturedFromFeed,
  SPOTLIGHT_TITLE_FALLBACK,
  SPOTLIGHT_TITLE_WEEK,
} from "./featured-feed";

function row(overrides: Partial<Prediction> = {}): Prediction {
  return {
    id: "id-1",
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

describe("pickFeaturedFromFeed", () => {
  const now = new Date("2026-04-30T12:00:00.000Z");

  test("given empty feed, returns empty slides and fallback title", () => {
    expect(pickFeaturedFromFeed([], 8, now)).toEqual({
      slides: [],
      spotlightTitle: SPOTLIGHT_TITLE_FALLBACK,
    });
  });

  test("given only old predictions, uses fallback title and newest-first backfill", () => {
    const old = new Date("2026-01-01T00:00:00.000Z").toISOString();
    const data = [
      row({ id: "a", created_at: old }),
      row({ id: "b", created_at: old }),
      row({ id: "c", created_at: old }),
    ];
    const { slides, spotlightTitle } = pickFeaturedFromFeed(data, 2, now);
    expect(spotlightTitle).toBe(SPOTLIGHT_TITLE_FALLBACK);
    expect(slides.map((p) => p.id)).toEqual(["c", "b"]);
  });

  test("given in-week items first, prefers them then backfills", () => {
    const old = new Date("2026-01-01T00:00:00.000Z").toISOString();
    const recent = new Date("2026-04-29T00:00:00.000Z").toISOString();
    const data = [
      row({ id: "old1", created_at: old }),
      row({ id: "new1", created_at: recent }),
      row({ id: "old2", created_at: old }),
      row({ id: "new2", created_at: recent }),
    ];
    const { slides, spotlightTitle } = pickFeaturedFromFeed(data, 3, now);
    expect(spotlightTitle).toBe(SPOTLIGHT_TITLE_WEEK);
    expect(slides.map((p) => p.id)).toEqual(["new2", "new1", "old2"]);
  });

  test("given all in-week, caps at max and uses week title", () => {
    const data = Array.from({ length: 10 }, (_, i) =>
      row({
        id: `n${i}`,
        created_at: new Date(`2026-04-${29 - i}T12:00:00.000Z`).toISOString(),
      }),
    );
    const max = 3;
    const { slides, spotlightTitle } = pickFeaturedFromFeed(data, max, now);
    expect(spotlightTitle).toBe(SPOTLIGHT_TITLE_WEEK);
    expect(slides).toHaveLength(max);
    expect(slides[0]!.id).toBe("n0");
  });

  test("default max matches carousel constant", () => {
    expect(DEFAULT_MAX_FEATURED_SLIDES).toBe(8);
  });
});
