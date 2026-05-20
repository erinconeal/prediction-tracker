import type { Prediction } from '@/types/prediction';
import {
  accuracyPercentFromRollup,
  emptySourceOutcomeRollup,
  addPredictionToRollup,
} from '@/lib/source-outcome-rollup';

export type SourceAccuracyStats = {
  name: string;
  total: number;
  pending: number;
  /** Correct + incorrect — constitution §7.2 denominator. */
  scored: number;
  correct: number;
  /** Terminal `unresolved` (§6.3), not pre-resolution `pending`. */
  outcomeUnresolved: number;
  invalid: number;
  /** Non-pending count (any terminal outcome). */
  resolved: number;
  /** One decimal percent; null when `scored === 0`. */
  accuracy: number | null;
};

/**
 * Aggregates counts and constitution-aligned accuracy for predictions
 * sharing one source (e.g. filtered `usePredictions` result).
 */
export function computeSourceAccuracyStats(
  predictions: Prediction[],
  options: {
    /** Used when the list is empty or has no `source` on row 0 (e.g. URL slug). */
    nameFallback: string;
    /** When set, preferred display name even if `predictions` is temporarily empty. */
    primaryName?: string | null;
  },
): SourceAccuracyStats {
  const name
    = (options.primaryName !== null
      && options.primaryName !== undefined
      && options.primaryName !== ''
      ? options.primaryName
      : undefined)
    ?? predictions[0]?.source
    ?? options.nameFallback;

  const rollup = emptySourceOutcomeRollup();
  for (const p of predictions) {
    addPredictionToRollup(rollup, p);
  }

  const resolved = rollup.total - rollup.pending;
  const accuracy = accuracyPercentFromRollup(rollup);

  return {
    name,
    total: rollup.total,
    pending: rollup.pending,
    scored: rollup.scored,
    correct: rollup.correct,
    outcomeUnresolved: rollup.outcomeUnresolved,
    invalid: rollup.invalid,
    resolved,
    accuracy,
  };
}
