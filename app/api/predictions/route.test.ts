import { beforeEach, describe, expect, test, vi } from "vitest";

async function loadRouteModule() {
  vi.resetModules();
  return import("./route");
}

describe("GET /api/predictions route", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  test("given no query params, should return a non-empty list of prediction rows", async () => {
    const { GET } = await loadRouteModule();
    const request = new Request("http://localhost/api/predictions");

    const response = await GET(request);
    const body = (await response.json()) as Array<{
      id: string;
      source: string;
      text: string;
      outcome: string;
    }>;

    expect(response.status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    expect(
      body.every(
        (row) =>
          typeof row.id === "string" &&
          typeof row.source === "string" &&
          typeof row.text === "string" &&
          ["pending", "correct", "incorrect"].includes(row.outcome),
      ),
    ).toBe(true);
  });

  test("given known status filter, should return only matching outcomes", async () => {
    const { GET } = await loadRouteModule();
    const request = new Request("http://localhost/api/predictions?status=correct");

    const response = await GET(request);
    const body = (await response.json()) as Array<{ outcome: string }>;

    expect(response.status).toBe(200);
    expect(body.length).toBeGreaterThan(0);
    expect(body.every((row) => row.outcome === "correct")).toBe(true);
  });

  test("given unknown status filter, should ignore it instead of erroring", async () => {
    const { GET } = await loadRouteModule();
    const allRequest = new Request("http://localhost/api/predictions");
    const unknownStatusRequest = new Request(
      "http://localhost/api/predictions?status=nope",
    );

    const allResponse = await GET(allRequest);
    const unknownStatusResponse = await GET(unknownStatusRequest);
    const allBody = (await allResponse.json()) as unknown[];
    const unknownStatusBody = (await unknownStatusResponse.json()) as unknown[];

    expect(unknownStatusResponse.status).toBe(200);
    expect(unknownStatusBody).toEqual(allBody);
  });

  test("given source query by slug, should filter by source", async () => {
    const { GET } = await loadRouteModule();
    const request = new Request(
      "http://localhost/api/predictions?source=jane-analyst",
    );

    const response = await GET(request);
    const body = (await response.json()) as Array<{ source: string }>;

    expect(response.status).toBe(200);
    expect(body.length).toBeGreaterThan(0);
    expect(body.every((row) => row.source === "Jane Analyst")).toBe(true);
  });

  test("given category query, should return only matching category case-insensitive", async () => {
    const { GET } = await loadRouteModule();
    const request = new Request(
      "http://localhost/api/predictions?category=economics",
    );

    const response = await GET(request);
    const body = (await response.json()) as Array<{ category: string | null }>;

    expect(response.status).toBe(200);
    expect(body.length).toBeGreaterThan(0);
    expect(body.every((row) => row.category === "Economics")).toBe(true);
  });

  test("given limit and offset, should return stable page slices", async () => {
    const { GET } = await loadRouteModule();
    const first = await GET(
      new Request("http://localhost/api/predictions?limit=1&offset=0"),
    );
    const second = await GET(
      new Request("http://localhost/api/predictions?limit=1&offset=1"),
    );
    const a = (await first.json()) as Array<{ id: string }>;
    const b = (await second.json()) as Array<{ id: string }>;

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(a).toHaveLength(1);
    expect(b).toHaveLength(1);
    expect(a[0]!.id).not.toBe(b[0]!.id);
  });

  test("given sort=recently_resolved, should list resolved rows before pending", async () => {
    const { GET } = await loadRouteModule();
    const response = await GET(
      new Request("http://localhost/api/predictions?sort=recently_resolved"),
    );
    const body = (await response.json()) as Array<{
      outcome: string;
      resolved_at: string | null;
    }>;

    expect(response.status).toBe(200);
    expect(body.length).toBeGreaterThanOrEqual(4);
    const firstPendingIndex = body.findIndex((r) => r.outcome === "pending");
    let lastResolvedIndex = -1;
    for (let i = 0; i < body.length; i++) {
      if (body[i]!.outcome !== "pending") lastResolvedIndex = i;
    }
    expect(firstPendingIndex).toBeGreaterThan(lastResolvedIndex);
    expect(
      body
        .filter((r) => r.outcome !== "pending")
        .every((r) => typeof r.resolved_at === "string"),
    ).toBe(true);
  });

  test("given unknown sort param, should behave like default ordering", async () => {
    const { GET } = await loadRouteModule();
    const defaultReq = new Request("http://localhost/api/predictions");
    const weirdSortReq = new Request(
      "http://localhost/api/predictions?sort=not-a-sort",
    );
    const defaultBody = (await (await GET(defaultReq)).json()) as unknown[];
    const weirdBody = (await (await GET(weirdSortReq)).json()) as unknown[];

    expect(weirdBody).toEqual(defaultBody);
  });
});

describe("POST /api/predictions route", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  test("given invalid JSON body, should return 400", async () => {
    const { POST } = await loadRouteModule();
    const request = new Request("http://localhost/api/predictions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{ invalid",
    });

    const response = await POST(request);
    const body = (await response.json()) as { message: string };

    expect(response.status).toBe(400);
    expect(body.message).toBe("Invalid JSON body");
  });

  test("given missing required strings, should return 400 validation error", async () => {
    const { POST } = await loadRouteModule();
    const request = new Request("http://localhost/api/predictions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: " ", text: "" }),
    });

    const response = await POST(request);
    const body = (await response.json()) as { message: string };

    expect(response.status).toBe(400);
    expect(body.message).toContain("required strings");
  });

  test("given valid payload, should create row and return 201", async () => {
    const { POST } = await loadRouteModule();
    const request = new Request("http://localhost/api/predictions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "  New Source  ",
        text: "  New prediction text  ",
        category: "  Markets  ",
        target_date: "2026-12-31",
      }),
    });

    const response = await POST(request);
    const body = (await response.json()) as {
      source: string;
      text: string;
      category: string | null;
      target_date: string | null;
      sourceSlug: string;
      outcome: string;
      id: string;
    };

    expect(response.status).toBe(201);
    expect(body.id).toBeTruthy();
    expect(body.source).toBe("New Source");
    expect(body.text).toBe("New prediction text");
    expect(body.category).toBe("Markets");
    expect(body.sourceSlug).toBe("new-source");
    expect(body.outcome).toBe("pending");
    expect(body.target_date).toBe("2026-12-31T00:00:00.000Z");
  });
});
