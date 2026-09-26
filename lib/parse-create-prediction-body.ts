import { normalizeTargetDate } from '@/lib/mappers/prediction-mapper';
import type { CreatePredictionInput } from '@/types/prediction';
import { isHttpOrHttpsUrl } from '@/utils/form-helpers';

export type ParseCreatePredictionResult
  = | { ok: true; value: CreatePredictionInput }
    | { ok: false; message: string };

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
      message: 'Source name and Prediction text are required',
    };
  }
  if (typeof b.created_at !== 'string' || !b.created_at.trim()) {
    return {
      ok: false,
      message: 'Date said is required and must be a valid date in YYYY-MM-DD format',
    };
  }
  let createdAt: string;
  try {
    createdAt = normalizeTargetDate(b.created_at);
  }
  catch {
    return {
      ok: false,
      message: 'Date said is required and must be a valid date in YYYY-MM-DD format',
    };
  }
  if (typeof b.evidenceUrl !== 'string' || !isHttpOrHttpsUrl(b.evidenceUrl)) {
    return {
      ok: false,
      message: 'Evidence URL is required and must be an http or https URL',
    };
  }
  const topicIds = Array.isArray(b.topicIds)
    ? b.topicIds.filter((id): id is string => typeof id === 'string')
    : [];
  if (topicIds.length === 0) {
    return {
      ok: false,
      message: 'Topics must include at least one topic',
    };
  }
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
