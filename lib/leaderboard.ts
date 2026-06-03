import { comparePredictionsNewestFirst } from '@/lib/prediction-sort';
import { isScoredOutcome } from '@/lib/prediction-outcome';
import {
  accuracyPercentFromRollup,
  rollupBySource,
  type SourceOutcomeRollup,
} from '@/lib/source-outcome-rollup';
import type { Prediction } from '@/types/prediction';

export type LeaderboardRow = {
  rank: number;
  source: string;
  /** Canonical route slug from the newest prediction for this source. */
  sourceSlug: string;
  total: number;
  /** Count with a terminal outcome (not `still_open`). */
  noLongerOpen: number;
  /** Correct + incorrect — denominator for constitution §7.2 accuracy. */
  scored: number;
  correct: number;
  /** One decimal; null when `scored === 0`. */
  accuracyPercent: number | null;
  stillOpen: number;
  /** Terminal `unresolved` outcome (§6.3), not pre-resolution `still_open`. */
  outcomeUnresolved: number;
  invalid: number;
  /**
   * Longest run of correct/incorrect from the newest scored prediction backward
   * (same ordering as the main feed: `created_at` desc, then global rank when
   * timestamps tie). Null when nothing scored for the source.
   */
  streakKind: 'correct' | 'incorrect' | null;
  streakLength: number;
};

function groupPredictionsBySource(predictions: Prediction[]) {
  const m = new Map<string, Prediction[]>();
  for (const p of predictions) {
    const list = m.get(p.source) ?? [];
    list.push(p);
    m.set(p.source, list);
  }
  return m;
}

/** Streak across only definitive correct/incorrect rows; unresolved/invalid break the run. */
function scoredOutcomeStreak(
  sourcePredictions: Prediction[],
  globalRankById: Map<string, number>,
): { kind: 'correct' | 'incorrect'; length: number } | null {
  const scored = sourcePredictions
    .filter(p => isScoredOutcome(p.outcome))
    .sort((a, b) => {
      const t
        = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (t !== 0) return t;
      return (globalRankById.get(a.id) ?? 0) - (globalRankById.get(b.id) ?? 0);
    });
  if (scored.length === 0) return null;
  const head = scored[0]!;
  const kind = head.outcome as 'correct' | 'incorrect';
  let length = 0;
  for (const p of scored) {
    if (p.outcome !== kind) break;
    length += 1;
  }
  return { kind, length };
}

function sourceSlugForSource(
  source: string,
  sourcePredictions: Prediction[],
  globalRankById: Map<string, number>,
): string {
  const sorted = [...sourcePredictions].sort((a, b) => {
    const t
      = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (t !== 0) return t;
    return (globalRankById.get(a.id) ?? 0) - (globalRankById.get(b.id) ?? 0);
  });
  return sorted[0]?.sourceSlug ?? source;
}

function rowFromRollup(
  source: string,
  sourceSlug: string,
  r: SourceOutcomeRollup,
) {
  const noLongerOpen = r.total - r.stillOpen;
  return {
    source,
    sourceSlug,
    total: r.total,
    noLongerOpen,
    scored: r.scored,
    correct: r.correct,
    accuracyPercent: accuracyPercentFromRollup(r),
    stillOpen: r.stillOpen,
    outcomeUnresolved: r.outcomeUnresolved,
    invalid: r.invalid,
  };
}

/**
 * Ranks sources for a “top performers” rail: higher accuracy (§7.2) first, then more
 * scored predictions. Sources with no scored rows sort last.
 */
export function computeLeaderboard(
  predictions: Prediction[],
  limit = 8,
): LeaderboardRow[] {
  const sortedGlobal = [...predictions].sort(comparePredictionsNewestFirst);
  const globalRankById = new Map(
    sortedGlobal.map((p, index) => [p.id, index]),
  );

  const bySource = rollupBySource(predictions);
  const bySourcePredictions = groupPredictionsBySource(predictions);
  const rows = [...bySource.entries()].map(([source, rollup]) =>
    rowFromRollup(
      source,
      sourceSlugForSource(
        source,
        bySourcePredictions.get(source) ?? [],
        globalRankById,
      ),
      rollup,
    ),
  );

  rows.sort((a, b) => {
    const ar = a.accuracyPercent ?? -1;
    const br = b.accuracyPercent ?? -1;
    if (br !== ar) return br - ar;
    if (b.scored !== a.scored) return b.scored - a.scored;
    return b.total - a.total;
  });

  return rows.slice(0, limit).map((r, i) => {
    const streak = scoredOutcomeStreak(
      bySourcePredictions.get(r.source) ?? [],
      globalRankById,
    );
    return {
      rank: i + 1,
      source: r.source,
      sourceSlug: r.sourceSlug,
      total: r.total,
      noLongerOpen: r.noLongerOpen,
      scored: r.scored,
      correct: r.correct,
      accuracyPercent: r.accuracyPercent,
      stillOpen: r.stillOpen,
      outcomeUnresolved: r.outcomeUnresolved,
      invalid: r.invalid,
      streakKind: streak?.kind ?? null,
      streakLength: streak?.length ?? 0,
    };
  });
}
