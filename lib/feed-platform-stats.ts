import {
  accuracyPercentFromRollup,
  addPredictionToRollup,
  emptySourceOutcomeRollup,
} from '@/lib/source-outcome-rollup';
import type { Prediction } from '@/types/prediction';

export type FeedPlatformStats = {
  trackedCount: number;
  averageAccuracyPercent: number | null;
};

export function computeFeedPlatformStats(
  predictions: Prediction[],
): FeedPlatformStats {
  const rollup = emptySourceOutcomeRollup();
  for (const p of predictions) {
    addPredictionToRollup(rollup, p);
  }
  return {
    trackedCount: predictions.length,
    averageAccuracyPercent: accuracyPercentFromRollup(rollup),
  };
}

export function formatTrackedCount(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return k >= 10 ? `${Math.round(k)}k` : `${k.toFixed(1)}k`;
  }
  return String(n);
}

export function formatAccuracyPercent(value: number | null): string {
  if (value === null) return '—';
  return `${Math.round(value)}%`;
}
