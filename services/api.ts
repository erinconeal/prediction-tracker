import type {
  CreatePredictionInput,
  Prediction,
  PredictionFilters,
  TerminalOutcome,
} from "@/types/prediction";
import type { LeaderboardRow } from "@/lib/leaderboard";
import type { Insight } from "@/lib/insights";

const BASE = "/api/predictions";
const LEADERBOARD_BASE = "/api/leaderboard";
const INSIGHTS_BASE = "/api/insights";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError("Invalid JSON response", response.status);
  }
}

function errorMessageFromBody(
  body: object,
  fallback: string,
): string {
  if (
    "message" in body &&
    typeof (body as { message?: unknown }).message === "string"
  ) {
    return (body as { message: string }).message;
  }
  return fallback;
}

function buildListUrl(filters: PredictionFilters): string {
  const params = new URLSearchParams();
  if (filters.source?.trim()) params.set("source", filters.source.trim());
  if (filters.status && filters.status !== "all") {
    params.set("status", filters.status);
  }
  if (filters.category?.trim()) {
    params.set("category", filters.category.trim());
  }
  if (filters.limit !== undefined) {
    params.set("limit", String(filters.limit));
  }
  if (filters.offset !== undefined) {
    params.set("offset", String(filters.offset));
  }
  if (filters.sort && filters.sort !== "newest") {
    params.set("sort", filters.sort);
  }
  const q = params.toString();
  return q ? `${BASE}?${q}` : BASE;
}

export async function listPredictions(
  filters: PredictionFilters = {},
  signal?: AbortSignal,
): Promise<Prediction[]> {
  const response = await fetch(buildListUrl(filters), {
    method: "GET",
    signal,
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) {
    let body: object = {};
    try {
      body = await parseJson<{ message?: string }>(response);
    } catch {
      /* ignore non-JSON error payloads */
    }
    throw new ApiError(
      errorMessageFromBody(body, `Request failed with ${response.status}`),
      response.status,
      body,
    );
  }
  const result = await parseJson<unknown>(response);
  if (!Array.isArray(result)) {
    throw new ApiError(
      "Predictions response must be a JSON array",
      response.status,
      result,
    );
  }
  return result as Prediction[];
}

export async function getPrediction(
  id: string,
  signal?: AbortSignal,
): Promise<Prediction> {
  const response = await fetch(`${BASE}/${encodeURIComponent(id)}`, {
    method: "GET",
    signal,
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  let body: { message?: string } & Partial<Prediction> = {};
  try {
    body = await parseJson<{ message?: string } & Partial<Prediction>>(response);
  } catch {
    /* ignore */
  }
  if (!response.ok) {
    throw new ApiError(
      errorMessageFromBody(body, `Request failed with ${response.status}`),
      response.status,
      body,
    );
  }
  return body as Prediction;
}

export async function listLeaderboard(
  limit = 8,
  signal?: AbortSignal,
): Promise<LeaderboardRow[]> {
  const params = new URLSearchParams();
  if (limit !== 8) params.set("limit", String(limit));
  const q = params.toString();
  const url = q ? `${LEADERBOARD_BASE}?${q}` : LEADERBOARD_BASE;
  const response = await fetch(url, {
    method: "GET",
    signal,
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) {
    let body: object = {};
    try {
      body = await parseJson<{ message?: string }>(response);
    } catch {
      /* ignore */
    }
    throw new ApiError(
      errorMessageFromBody(body, `Request failed with ${response.status}`),
      response.status,
      body,
    );
  }
  const result = await parseJson<unknown>(response);
  if (!Array.isArray(result)) {
    throw new ApiError(
      "Leaderboard response must be a JSON array",
      response.status,
      result,
    );
  }
  return result as LeaderboardRow[];
}

function parseInsightPayload(raw: unknown, status: number): Insight {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new ApiError(
      "Insight response must be a JSON object or null",
      status,
      raw,
    );
  }
  const o = raw as Record<string, unknown>;
  const kind = o.kind;
  const headline = o.headline;
  if (typeof kind !== "string" || typeof headline !== "string") {
    throw new ApiError(
      "Insight response must include string kind and headline",
      status,
      raw,
    );
  }
  switch (kind) {
    case "top_accuracy": {
      if (
        typeof o.source !== "string" ||
        typeof o.correct !== "number" ||
        typeof o.scored !== "number" ||
        !Number.isFinite(o.correct) ||
        !Number.isFinite(o.scored)
      ) {
        throw new ApiError(
          "Invalid top_accuracy insight payload",
          status,
          raw,
        );
      }
      return {
        kind,
        headline,
        source: o.source,
        correct: o.correct,
        scored: o.scored,
      };
    }
    case "hot_streak": {
      if (
        typeof o.source !== "string" ||
        typeof o.length !== "number" ||
        !Number.isFinite(o.length)
      ) {
        throw new ApiError("Invalid hot_streak insight payload", status, raw);
      }
      return {
        kind: "hot_streak",
        headline,
        source: o.source,
        length: o.length,
      };
    }
    case "cold_streak": {
      if (
        typeof o.source !== "string" ||
        typeof o.length !== "number" ||
        !Number.isFinite(o.length)
      ) {
        throw new ApiError("Invalid cold_streak insight payload", status, raw);
      }
      return {
        kind: "cold_streak",
        headline,
        source: o.source,
        length: o.length,
      };
    }
    case "category_gap": {
      if (
        typeof o.topCategory !== "string" ||
        typeof o.bottomCategory !== "string" ||
        typeof o.topPercent !== "number" ||
        typeof o.bottomPercent !== "number" ||
        !Number.isFinite(o.topPercent) ||
        !Number.isFinite(o.bottomPercent)
      ) {
        throw new ApiError("Invalid category_gap insight payload", status, raw);
      }
      return {
        kind,
        headline,
        topCategory: o.topCategory,
        bottomCategory: o.bottomCategory,
        topPercent: o.topPercent,
        bottomPercent: o.bottomPercent,
      };
    }
    case "unresolved_majority": {
      if (
        typeof o.pendingPercent !== "number" ||
        !Number.isFinite(o.pendingPercent)
      ) {
        throw new ApiError(
          "Invalid unresolved_majority insight payload",
          status,
          raw,
        );
      }
      return {
        kind,
        headline,
        pendingPercent: o.pendingPercent,
      };
    }
    default:
      throw new ApiError(`Unknown insight kind: ${kind}`, status, raw);
  }
}

export async function getTopInsight(
  signal?: AbortSignal,
): Promise<Insight | null> {
  const response = await fetch(INSIGHTS_BASE, {
    method: "GET",
    signal,
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) {
    let body: object = {};
    try {
      body = await parseJson<{ message?: string }>(response);
    } catch {
      /* ignore */
    }
    throw new ApiError(
      errorMessageFromBody(body, `Request failed with ${response.status}`),
      response.status,
      body,
    );
  }
  const result = await parseJson<unknown>(response);
  if (result === null) return null;
  return parseInsightPayload(result, response.status);
}

export async function createPrediction(
  input: CreatePredictionInput,
  signal?: AbortSignal,
): Promise<Prediction> {
  const response = await fetch(BASE, {
    method: "POST",
    signal,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  let body: { message?: string } & Partial<Prediction> = {};
  try {
    body = await parseJson<{ message?: string } & Partial<Prediction>>(response);
  } catch {
    /* ignore parse failures; still branch on status below */
  }
  if (!response.ok) {
    throw new ApiError(
      errorMessageFromBody(body, `Request failed with ${response.status}`),
      response.status,
      body,
    );
  }
  return body as Prediction;
}

export async function updatePredictionOutcome(
  id: string,
  outcome: TerminalOutcome,
  signal?: AbortSignal,
): Promise<Prediction> {
  const response = await fetch(`${BASE}/${encodeURIComponent(id)}`, {
    method: "PATCH",
    signal,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ outcome }),
  });
  let body: { message?: string } & Partial<Prediction> = {};
  try {
    body = await parseJson<{ message?: string } & Partial<Prediction>>(response);
  } catch {
    /* ignore parse failures; still branch on status below */
  }
  if (!response.ok) {
    throw new ApiError(
      errorMessageFromBody(body, `Request failed with ${response.status}`),
      response.status,
      body,
    );
  }
  return body as Prediction;
}
