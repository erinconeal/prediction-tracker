import { formatCompactCount } from '@/lib/format-compact-count';
import {
  accuracyPercentFromRollup,
  addPredictionToRollup,
  emptySourceOutcomeRollup,
} from '@/lib/source-outcome-rollup';
import type { Prediction } from '@/types/prediction';

export { formatCompactCount } from '@/lib/format-compact-count';

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
  return formatCompactCount(n);
}

export function formatAccuracyPercent(value: number | null): string {
  if (value === null) return '—';
  return `${Math.round(value)}%`;
}
