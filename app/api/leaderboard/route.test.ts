import { beforeEach, describe, expect, test, vi } from "vitest";

async function loadRouteModule() {
  vi.resetModules();
  return import("./route");
}

describe("GET /api/leaderboard route", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  test("should return JSON array of leaderboard rows", async () => {
    const { GET } = await loadRouteModule();
    const response = await GET(new Request("http://localhost/api/leaderboard"));
    const body = (await response.json()) as Array<{
      rank: number;
      source: string;
      accuracyPercent: number | null;
    }>;

    expect(response.status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    expect(body[0]!.rank).toBe(1);
    expect(typeof body[0]!.source).toBe("string");
  });
});
