import { isScoredOutcome } from '@/lib/prediction-outcome';
import { comparePredictionsNewestFirst } from '@/lib/prediction-sort';
import type { Prediction } from '@/types/prediction';

export type RecentResolution = {
  prediction: Prediction;
  resolvedAt: string;
};

/**
 * Scored resolutions only (correct/incorrect per constitution §7.2).
 * Unresolved, invalid, and pending predictions are excluded even when `resolved_at` is set.
 * Sorted by resolution time (newest first).
 */
export function pickRecentScoredResolutions(
  predictions: Prediction[],
  limit = 5,
): RecentResolution[] {
  const resolved = predictions.filter(
    p => isScoredOutcome(p.outcome) && p.resolved_at,
  );
  resolved.sort((a, b) => {
    const ta = a.resolved_at ? Date.parse(a.resolved_at) : 0;
    const tb = b.resolved_at ? Date.parse(b.resolved_at) : 0;
    if (tb !== ta) return tb - ta;
    return comparePredictionsNewestFirst(a, b);
  });
  return resolved.slice(0, limit).map(prediction => ({
    prediction,
    resolvedAt: prediction.resolved_at!,
  }));
}
