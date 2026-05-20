import type { Prediction } from '@/types/prediction';
import {
  isPendingOutcome,
  isScoredOutcome,
} from '@/lib/prediction-outcome';

/** Per-source counts for constitution-aligned accuracy (§7.2–7.3). */
export type SourceOutcomeRollup = {
  total: number;
  pending: number;
  /** correct + incorrect — accuracy denominator. */
  scored: number;
  correct: number;
  /** Terminal `unresolved` outcome count (not pending). */
  outcomeUnresolved: number;
  invalid: number;
};

export function emptySourceOutcomeRollup(): SourceOutcomeRollup {
  return {
    total: 0,
    pending: 0,
    scored: 0,
    correct: 0,
    outcomeUnresolved: 0,
    invalid: 0,
  };
}

export function addPredictionToRollup(
  r: SourceOutcomeRollup,
  p: Prediction,
): void {
  r.total += 1;
  if (isPendingOutcome(p.outcome)) {
    r.pending += 1;
    return;
  }
  if (p.outcome === 'unresolved') {
    r.outcomeUnresolved += 1;
    return;
  }
  if (p.outcome === 'invalid') {
    r.invalid += 1;
    return;
  }
  if (isScoredOutcome(p.outcome)) {
    r.scored += 1;
    if (p.outcome === 'correct') r.correct += 1;
  }
}

export function accuracyPercentFromRollup(
  r: SourceOutcomeRollup,
): number | null {
  if (r.scored === 0) return null;
  return (Math.round((r.correct / r.scored) * 1000) / 10) as number;
}

export function rollupBySource(
  predictions: Prediction[],
): Map<string, SourceOutcomeRollup> {
  const m = new Map<string, SourceOutcomeRollup>();
  for (const p of predictions) {
    const cur = m.get(p.source) ?? emptySourceOutcomeRollup();
    addPredictionToRollup(cur, p);
    m.set(p.source, cur);
  }
  return m;
}
