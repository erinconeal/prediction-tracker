import { beforeEach, describe, expect, test, vi } from "vitest";

async function loadRoutes() {
  vi.resetModules();
  const collection = await import("../route");
  const item = await import("./route");
  return { ...collection, ...item };
}

describe("PATCH /api/predictions/[id] route", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  test("given invalid JSON body, should return 400", async () => {
    const { PATCH } = await loadRoutes();
    const request = new Request("http://localhost/api/predictions/x", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: "{ bad-json",
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "x" }) });
    const body = (await response.json()) as { message: string };

    expect(response.status).toBe(400);
    expect(body.message).toBe("Invalid JSON body");
  });

  test("given unsupported outcome, should return 400", async () => {
    const { PATCH } = await loadRoutes();
    const request = new Request("http://localhost/api/predictions/x", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outcome: "pending" }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: "x" }) });
    const body = (await response.json()) as { message: string };

    expect(response.status).toBe(400);
    expect(body.message).toContain("must be");
  });

  test("given unknown id, should return 404", async () => {
    const { PATCH } = await loadRoutes();
    const request = new Request("http://localhost/api/predictions/does-not-exist", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ outcome: "correct" }),
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: "does-not-exist" }),
    });
    const body = (await response.json()) as { message: string };

    expect(response.status).toBe(404);
    expect(body.message).toBe("Prediction not found");
  });

  test("given existing id and valid outcome, should patch and return updated row", async () => {
    const { POST, PATCH } = await loadRoutes();
    const createRequest = new Request("http://localhost/api/predictions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source: "Patch Source", text: "Update me" }),
    });
    const created = (await (await POST(createRequest)).json()) as {
      id: string;
      outcome: string;
    };

    const patchRequest = new Request(
      `http://localhost/api/predictions/${created.id}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcome: "incorrect" }),
      },
    );
    const response = await PATCH(patchRequest, {
      params: Promise.resolve({ id: created.id }),
    });
    const body = (await response.json()) as { id: string; outcome: string };

    expect(response.status).toBe(200);
    expect(body.id).toBe(created.id);
    expect(body.outcome).toBe("incorrect");
  });
});
