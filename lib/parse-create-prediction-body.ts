import { normalizeTargetDate } from '@/lib/mappers/prediction-mapper';
import type { CreatePredictionInput } from '@/types/prediction';

export type ParseCreatePredictionResult
  = | { ok: true; value: CreatePredictionInput }
    | { ok: false; message: string };

function isHttpOrHttpsUrl(value: string): boolean {
  try {
    const { protocol } = new URL(value.trim());
    return protocol === 'http:' || protocol === 'https:';
  }
  catch {
    return false;
  }
}

/**
 * Validates a POST /api/predictions JSON body into create input.
 */
export function parseCreatePredictionBody(
  body: unknown,
): ParseCreatePredictionResult {
  if (!body || typeof body !== 'object') {
    return { ok: false, message: 'Expected object body' };
  }
  const b = body as Record<string, unknown>;
  const source = typeof b.source === 'string' ? b.source : '';
  const text = typeof b.text === 'string' ? b.text : '';
  if (!source.trim() || !text.trim()) {
    return {
      ok: false,
      message: '`source` and `text` are required strings',
    };
  }
  if (typeof b.created_at !== 'string' || !b.created_at.trim()) {
    return {
      ok: false,
      message: '`created_at` is required and must be an ISO date or YYYY-MM-DD',
    };
  }
  let createdAt: string;
  try {
    createdAt = normalizeTargetDate(b.created_at);
  }
  catch {
    return {
      ok: false,
      message: '`created_at` is required and must be an ISO date or YYYY-MM-DD',
    };
  }
  if (typeof b.evidenceUrl !== 'string' || !isHttpOrHttpsUrl(b.evidenceUrl)) {
    return {
      ok: false,
      message: '`evidenceUrl` is required and must be an http: or https: URL',
    };
  }
  const topicIds = Array.isArray(b.topicIds)
    ? b.topicIds.filter((id): id is string => typeof id === 'string')
    : [];
  return {
    ok: true,
    value: {
      source,
      text,
      topicIds,
      target_date: typeof b.target_date === 'string' ? b.target_date : undefined,
      created_at: createdAt,
      evidenceUrl: b.evidenceUrl.trim(),
    },
  };
}
