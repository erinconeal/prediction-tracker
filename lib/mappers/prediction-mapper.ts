import { predictions, sources } from '@/lib/schema';
import type { CreatePredictionInput, Outcome, Prediction } from '@/types/prediction';

type PredictionRow = typeof predictions.$inferSelect;
type SourceRow = typeof sources.$inferSelect;

export function normalizeTargetDate(value: string): string {
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return new Date(`${trimmed}T00:00:00.000Z`).toISOString();
  }
  return new Date(trimmed).toISOString();
}

export function toPrediction(
  row: PredictionRow,
  source: SourceRow,
  topicIds: string[],
): Prediction {
  return {
    id: row.id,
    source: source.displayName,
    sourceSlug: source.slug,
    text: row.text,
    topicIds,
    created_at: row.createdAt,
    finished_at: row.finishedAt ?? null,
    target_date: row.targetDate ?? null,
    outcome: row.outcome as Outcome,
    evidenceUrl: row.evidenceUrl ?? null,
  };
}

export function toPredictionInsert(
  input: CreatePredictionInput,
  sourceId: string,
  createdAtIso: string,
) {
  return {
    id: crypto.randomUUID(),
    sourceId,
    text: input.text.trim(),
    createdAt: createdAtIso,
    finishedAt: null,
    targetDate: input.target_date?.trim()
      ? normalizeTargetDate(input.target_date)
      : null,
    outcome: 'still_open' as const,
    evidenceUrl: input.evidenceUrl.trim(),
  };
}
