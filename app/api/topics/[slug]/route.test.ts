import { beforeEach, describe, expect, test, vi } from "vitest";

async function loadRouteModule() {
  vi.resetModules();
  return import("./route");
}

describe("GET /api/topics/[slug] route", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  test("given a known slug, should return topic detail with prediction count", async () => {
    const { GET } = await loadRouteModule();
    const response = await GET(new Request("http://localhost/api/topics/x"), {
      params: Promise.resolve({ slug: "ai-regulation-2026" }),
    });
    const body = (await response.json()) as {
      slug: string;
      predictionCount: number;
    };

    expect(response.status).toBe(200);
    expect(body.slug).toBe("ai-regulation-2026");
    expect(typeof body.predictionCount).toBe("number");
    expect(body.predictionCount).toBeGreaterThan(0);
  });

  test("given an unknown slug, should respond with 404", async () => {
    const { GET } = await loadRouteModule();
    const response = await GET(new Request("http://localhost/api/topics/x"), {
      params: Promise.resolve({ slug: "not-a-real-topic" }),
    });

    expect(response.status).toBe(404);
  });
});
