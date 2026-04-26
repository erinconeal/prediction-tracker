import type {
  CreatePredictionInput,
  Outcome,
  Prediction,
  PredictionFilters,
} from "@/types/prediction";

const BASE = "/api/predictions";

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
  outcome: Exclude<Outcome, "pending">,
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
