import type {
  CreatePredictionInput,
  Prediction,
  PredictionFilters,
  TerminalOutcome,
} from '@/types/prediction';
import { toListRequestFilters } from '@/utils/list-request-filters';
import type { LeaderboardPage } from '@/lib/leaderboard';
import { TOPIC_KINDS, type Topic, type TopicKind } from '@/types/topic';

/**
 * Browser-side client for `/api/predictions`, `/api/topics`, and `/api/leaderboard`.
 * GET helpers use `cache: 'no-store'` and optional `AbortSignal`; failures throw
 * `ApiError` after validating JSON shape where the response contract is non-obvious.
 */
const PREDICTIONS_BASE = '/api/predictions';
const LEADERBOARD_BASE = '/api/leaderboard';
const TOPICS_BASE = '/api/topics';

export type TrendingTopicDto = Topic & {
  count: number;
  recentCount: number;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) return {} as T;
  try {
    return JSON.parse(text) as T;
  }
  catch {
    throw new ApiError('Invalid JSON response', response.status);
  }
}

function errorMessageFromBody(
  body: object,
  fallback: string,
): string {
  if (
    'message' in body
    && typeof (body as { message?: unknown }).message === 'string'
  ) {
    return (body as { message: string }).message;
  }
  return fallback;
}

function isTopicKind(value: unknown): value is TopicKind {
  return typeof value === 'string'
    && (TOPIC_KINDS as readonly string[]).includes(value);
}

/**
 * Shared GET for JSON resources: soft-parse error bodies, hard-parse success
 * bodies, optionally validate the success payload before returning.
 */
async function getJsonResource<T>(
  url: string,
  {
    signal,
    validate,
  }: {
    signal?: AbortSignal;
    validate?: (body: unknown, status: number) => T;
  } = {},
): Promise<T> {
  const response = await fetch(url, {
    method: 'GET',
    signal,
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!response.ok) {
    let body: unknown = {};
    try {
      body = await parseJson(response);
    }
    catch {
      /* ignore — still throw with status below */
    }
    const errBody
      = body && typeof body === 'object' ? body as object : {};
    throw new ApiError(
      errorMessageFromBody(errBody, `Request failed with ${response.status}`),
      response.status,
      body,
    );
  }
  const body = await parseJson(response);
  if (validate) {
    return validate(body, response.status);
  }
  return body as T;
}

/**
 * JSON write headers. The staff secret is caller-supplied so the browser
 * bundle never reads `STAFF_SECRET`.
 */
function jsonWriteHeaders(staffSecret?: string): Record<string, string> {
  return {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(staffSecret ? { 'x-staff-secret': staffSecret } : {}),
  };
}

function requireJsonArray<T>(
  label: string,
): (body: unknown, status: number) => T[] {
  return (body, status) => {
    if (!Array.isArray(body)) {
      throw new ApiError(
        `${label} response must be a JSON array`,
        status,
        body,
      );
    }
    return body as T[];
  };
}

function buildListUrl(filters: PredictionFilters): string {
  const requestFilters = toListRequestFilters(filters);
  const params = new URLSearchParams();
  if (requestFilters.source?.trim()) {
    params.set('source', requestFilters.source.trim());
  }
  if (requestFilters.status && requestFilters.status !== 'all') {
    params.set('status', requestFilters.status);
  }
  if (requestFilters.topic?.trim()) {
    params.set('topic', requestFilters.topic.trim());
  }
  if (requestFilters.limit !== undefined) {
    params.set('limit', String(requestFilters.limit));
  }
  if (requestFilters.offset !== undefined) {
    params.set('offset', String(requestFilters.offset));
  }
  if (requestFilters.sort) {
    params.set('sort', requestFilters.sort);
  }
  const q = params.toString();
  return q ? `${PREDICTIONS_BASE}?${q}` : PREDICTIONS_BASE;
}

export async function listPredictions(
  filters: PredictionFilters = {},
  signal?: AbortSignal,
): Promise<Prediction[]> {
  return getJsonResource<Prediction[]>(buildListUrl(filters), {
    signal,
    validate: requireJsonArray<Prediction>('Predictions'),
  });
}

export async function getPrediction(
  id: string,
  signal?: AbortSignal,
): Promise<Prediction> {
  return getJsonResource<Prediction>(
    `${PREDICTIONS_BASE}/${encodeURIComponent(id)}`,
    { signal },
  );
}

export type TopicDetailDto = Topic & {
  predictionCount: number;
};

const TOPIC_CONTRACT_ERROR
  = 'Topic response must include a slug and a known kind';

export async function getTopic(
  slug: string,
  signal?: AbortSignal,
): Promise<TopicDetailDto> {
  return getJsonResource<TopicDetailDto>(
    `${TOPICS_BASE}/${encodeURIComponent(slug)}`,
    {
      signal,
      validate(body, status) {
        if (
          !body
          || typeof body !== 'object'
          || typeof (body as { slug?: unknown }).slug !== 'string'
          || !isTopicKind((body as { kind?: unknown }).kind)
        ) {
          throw new ApiError(TOPIC_CONTRACT_ERROR, status, body);
        }
        return body as TopicDetailDto;
      },
    },
  );
}

export async function listTopics(
  options: {
    trending?: boolean;
    bucket?: string;
    limit?: number;
    signal?: AbortSignal;
  } = {},
): Promise<Topic[] | TrendingTopicDto[]> {
  const params = new URLSearchParams();
  if (options.trending) params.set('trending', 'true');
  if (options.bucket?.trim()) params.set('bucket', options.bucket.trim());
  if (options.limit !== undefined) params.set('limit', String(options.limit));
  const q = params.toString();
  const url = q ? `${TOPICS_BASE}?${q}` : TOPICS_BASE;
  return getJsonResource<Topic[] | TrendingTopicDto[]>(url, {
    signal: options.signal,
    validate: requireJsonArray<Topic | TrendingTopicDto>('Topics'),
  });
}

export type ListLeaderboardOptions = {
  limit?: number;
  offset?: number;
  signal?: AbortSignal;
};

export async function listLeaderboard(
  options: ListLeaderboardOptions = {},
): Promise<LeaderboardPage> {
  const { limit = 8, offset = 0, signal } = options;
  const params = new URLSearchParams();
  if (limit !== 8) params.set('limit', String(limit));
  if (offset !== 0) params.set('offset', String(offset));
  const q = params.toString();
  const url = q ? `${LEADERBOARD_BASE}?${q}` : LEADERBOARD_BASE;
  return getJsonResource<LeaderboardPage>(url, {
    signal,
    validate(body, status) {
      if (
        !body
        || typeof body !== 'object'
        || !Array.isArray((body as LeaderboardPage).rows)
      ) {
        throw new ApiError(
          'Leaderboard response must be a paginated page object',
          status,
          body,
        );
      }
      return body as LeaderboardPage;
    },
  });
}

export type PredictionWriteOptions = {
  signal?: AbortSignal;
  staffSecret?: string;
};

/**
 * Creates a prediction via POST /api/predictions.
 */
export async function createPrediction(
  input: CreatePredictionInput,
  { signal, staffSecret }: PredictionWriteOptions = {},
): Promise<Prediction> {
  const response = await fetch(PREDICTIONS_BASE, {
    method: 'POST',
    signal,
    headers: jsonWriteHeaders(staffSecret),
    body: JSON.stringify(input),
  });
  let body: { message?: string } & Partial<Prediction> = {};
  try {
    body = await parseJson<{ message?: string } & Partial<Prediction>>(response);
  }
  catch {
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

/**
 * Sets a terminal outcome via PATCH /api/predictions/:id.
 */
export async function updatePredictionOutcome(
  id: string,
  outcome: TerminalOutcome,
  { signal, staffSecret }: PredictionWriteOptions = {},
): Promise<Prediction> {
  const response = await fetch(`${PREDICTIONS_BASE}/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    signal,
    headers: jsonWriteHeaders(staffSecret),
    body: JSON.stringify({ outcome }),
  });
  let body: { message?: string } & Partial<Prediction> = {};
  try {
    body = await parseJson<{ message?: string } & Partial<Prediction>>(response);
  }
  catch {
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
