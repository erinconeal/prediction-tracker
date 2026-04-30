import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { Prediction } from "@/types/prediction";
import {
  ApiError,
  createPrediction,
  getPrediction,
  listLeaderboard,
  listPredictions,
  updatePredictionOutcome,
} from "./api";

function samplePrediction(overrides: Partial<Prediction> = {}): Prediction {
  return {
    id: "p-1",
    source: "Alice",
    sourceSlug: "alice",
    text: "It will rain",
    category: null,
    created_at: "2024-01-01T00:00:00.000Z",
    target_date: null,
    outcome: "pending",
    ...overrides,
  };
}

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  const bodyText =
    typeof body === "string" ? body : JSON.stringify(body);
  return new Response(bodyText, {
    status: init?.status ?? 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

describe("listPredictions", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("given default filters, should GET /api/predictions with no-store and Accept header", async () => {
    const row = samplePrediction();
    fetchMock.mockResolvedValue(jsonResponse([row]));

    await listPredictions({});

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/predictions",
      expect.objectContaining({
        method: "GET",
        cache: "no-store",
        headers: { Accept: "application/json" },
      }),
    );
  });

  test("given source and non-all status, should append query parameters", async () => {
    fetchMock.mockResolvedValue(jsonResponse([]));

    await listPredictions({ source: "  Bob  ", status: "correct" });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/predictions?source=Bob&status=correct",
      expect.anything(),
    );
  });

  test("given category limit and offset, should append query parameters", async () => {
    fetchMock.mockResolvedValue(jsonResponse([]));

    await listPredictions({
      category: "Tech",
      limit: 20,
      offset: 40,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/predictions?category=Tech&limit=20&offset=40",
      expect.anything(),
    );
  });

  test("given ok JSON array, should return predictions", async () => {
    const row = samplePrediction({ id: "x" });
    fetchMock.mockResolvedValue(jsonResponse([row]));

    const result = await listPredictions({});

    expect(result).toEqual([row]);
  });

  test("given ok body that is not JSON, should throw ApiError", async () => {
    fetchMock.mockResolvedValue(
      new Response("not-json{", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(listPredictions({})).rejects.toMatchObject({
      name: "ApiError",
      message: "Invalid JSON response",
    });
  });

  test("given ok JSON that is not an array, should throw ApiError", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ predictions: [] }));

    await expect(listPredictions({})).rejects.toMatchObject({
      name: "ApiError",
      message: "Predictions response must be a JSON array",
    });
  });

  test("given non-ok response with message in JSON body, should throw ApiError with that message", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ message: "Source required" }, { status: 400 }),
    );

    await expect(listPredictions({})).rejects.toMatchObject({
      name: "ApiError",
      message: "Source required",
      status: 400,
    });
  });

  test("given non-ok response with empty body, should throw ApiError with status fallback", async () => {
    fetchMock.mockResolvedValue(new Response("", { status: 502 }));

    await expect(listPredictions({})).rejects.toMatchObject({
      name: "ApiError",
      message: "Request failed with 502",
      status: 502,
    });
  });
});

describe("getPrediction", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("should GET encoded id", async () => {
    const row = samplePrediction({ id: "abc" });
    fetchMock.mockResolvedValue(jsonResponse(row));

    const result = await getPrediction("abc");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/predictions/abc",
      expect.objectContaining({ method: "GET", cache: "no-store" }),
    );
    expect(result).toEqual(row);
  });
});

describe("listLeaderboard", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("default should GET /api/leaderboard", async () => {
    fetchMock.mockResolvedValue(jsonResponse([{ rank: 1, source: "A" }]));

    const result = await listLeaderboard();

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/leaderboard",
      expect.objectContaining({ method: "GET" }),
    );
    expect(result).toEqual([{ rank: 1, source: "A" }]);
  });
});

describe("createPrediction", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("given 201 with prediction JSON, should return parsed prediction", async () => {
    const created = samplePrediction({ id: "new" });
    fetchMock.mockResolvedValue(jsonResponse(created, { status: 201 }));

    const input = {
      source: "Bob",
      text: "Stocks up",
      category: "markets",
    };
    const result = await createPrediction(input);

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/predictions",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(input),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }),
    );
    expect(result).toEqual(created);
  });

  test("given error JSON, should throw ApiError with message", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ message: "Invalid payload" }, { status: 422 }),
    );

    await expect(
      createPrediction({ source: "x", text: "y" }),
    ).rejects.toMatchObject({
      name: "ApiError",
      message: "Invalid payload",
      status: 422,
    });
  });
});

describe("updatePredictionOutcome", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("given ok response, should PATCH encoded id with outcome body", async () => {
    const updated = samplePrediction({ id: "a/b", outcome: "correct" });
    fetchMock.mockResolvedValue(jsonResponse(updated));

    const result = await updatePredictionOutcome("a/b", "correct");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/predictions/a%2Fb",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ outcome: "correct" }),
      }),
    );
    expect(result).toEqual(updated);
  });

  test("given non-ok response, should throw ApiError", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ message: "Not found" }, { status: 404 }),
    );

    await expect(
      updatePredictionOutcome("missing", "incorrect"),
    ).rejects.toMatchObject({
      name: "ApiError",
      message: "Not found",
      status: 404,
    });
  });
});

describe("ApiError", () => {
  test("given constructor args, should expose status and optional body", () => {
    const err = new ApiError("oops", 500, { detail: "x" });
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe("oops");
    expect(err.status).toBe(500);
    expect(err.body).toEqual({ detail: "x" });
  });
});
