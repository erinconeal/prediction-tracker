import { isScoredOutcome } from '@/lib/prediction-outcome';
import { comparePredictionsNewestFirst } from '@/lib/prediction-sort';
import type { Prediction } from '@/types/prediction';

export type RecentlyJudgedScored = {
  prediction: Prediction;
  finishedAt: string;
};

/**
 * Scored outcomes only (correct/incorrect per constitution §7.2).
 * Unresolved, invalid, and still_open predictions are excluded even when `finished_at` is set.
 * Sorted by finish time (newest first).
 */
export function pickRecentlyJudgedScored(
  predictions: Prediction[],
  limit = 5,
): RecentlyJudgedScored[] {
  const finished = predictions.filter(
    p => isScoredOutcome(p.outcome) && p.finished_at,
  );
  finished.sort((a, b) => {
    const ta = a.finished_at ? Date.parse(a.finished_at) : 0;
    const tb = b.finished_at ? Date.parse(b.finished_at) : 0;
    if (tb !== ta) return tb - ta;
    return comparePredictionsNewestFirst(a, b);
  });
  return finished.slice(0, limit).map(prediction => ({
    prediction,
    finishedAt: prediction.finished_at!,
  }));
}
