import { beforeEach, describe, expect, test, vi } from "vitest";

async function loadRouteModule() {
  vi.resetModules();
  return import("./route");
}

describe("GET /api/insights route", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  test("should return JSON insight or null with 200", async () => {
    const { GET } = await loadRouteModule();
    const response = await GET();
    const body = (await response.json()) as
      | { kind: string; headline: string }
      | null;

    expect(response.status).toBe(200);
    if (body !== null) {
      expect(typeof body.kind).toBe("string");
      expect(typeof body.headline).toBe("string");
      expect(
        [
          "top_accuracy",
          "hot_streak",
          "cold_streak",
          "category_gap",
          "unresolved_majority",
        ].includes(body.kind),
      ).toBe(true);
    }
  });

  test("returns null when no insight clears threshold", async () => {
    vi.resetModules();
    vi.doMock("@/lib/prediction-store", () => ({
      filterAndSortPredictions: () => [
        {
          id: "1",
          source: "A",
          sourceSlug: "a",
          text: "t",
          category: null,
          created_at: "2026-01-01T00:00:00.000Z",
          resolved_at: "2026-01-01T00:00:00.000Z",
          outcome: "correct",
          target_date: null,
        },
        {
          id: "2",
          source: "A",
          sourceSlug: "a",
          text: "t",
          category: null,
          created_at: "2026-01-01T00:00:00.000Z",
          resolved_at: "2026-01-01T00:00:00.000Z",
          outcome: "incorrect",
          target_date: null,
        },
      ],
    }));
    const { GET } = await import("./route");
    const response = await GET();
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body).toBeNull();
    vi.doUnmock("@/lib/prediction-store");
  });
});
