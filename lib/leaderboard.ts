import { comparePredictionsNewestFirst } from '@/lib/prediction-sort';
import { isScoredOutcome } from '@/lib/prediction-outcome';
import {
  accuracyPercentFromRollup,
  rollupBySource,
  type SourceOutcomeRollup,
} from '@/lib/source-outcome-rollup';
import {
  platformLeaderboardDisplayStats,
  shouldShowFullLeaderboardFromStats,
  type LeaderboardDisplayStats,
} from '@/lib/leaderboard-display';
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

export type LeaderboardPage = {
  rows: LeaderboardRow[];
  /** All sources in the ranking (including zero scored). */
  total: number;
  /** Sources with at least one scored prediction. */
  rankedCount: number;
  offset: number;
  limit: number;
  hasMore: boolean;
  /** Platform-wide gating stats computed before pagination. */
  displayStats: LeaderboardDisplayStats;
  /** Whether full rankings UI should render (server-computed). */
  showFullRankings: boolean;
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

type LeaderboardSortRow = ReturnType<typeof rowFromRollup>;

function sortLeaderboardRows(rows: LeaderboardSortRow[]): LeaderboardSortRow[] {
  return [...rows].sort((a, b) => {
    const ar = a.accuracyPercent ?? -1;
    const br = b.accuracyPercent ?? -1;
    if (br !== ar) return br - ar;
    if (b.scored !== a.scored) return b.scored - a.scored;
    return b.total - a.total;
  });
}

function buildLeaderboardRows(
  sorted: LeaderboardSortRow[],
  offset: number,
  limit: number,
  bySourcePredictions: Map<string, Prediction[]>,
  globalRankById: Map<string, number>,
): LeaderboardRow[] {
  return sorted.slice(offset, offset + limit).map((r, i) => {
    const streak = scoredOutcomeStreak(
      bySourcePredictions.get(r.source) ?? [],
      globalRankById,
    );
    return {
      rank: offset + i + 1,
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

/**
 * Ranks sources for a “top performers” rail: higher accuracy (§7.2) first, then more
 * scored predictions. Sources with no scored rows sort last.
 */
export function computeLeaderboardPage(
  predictions: Prediction[],
  options: { limit?: number; offset?: number } = {},
): LeaderboardPage {
  const limit = Math.min(50, Math.max(1, options.limit ?? 8));
  const offset = Math.max(0, options.offset ?? 0);

  const sortedGlobal = [...predictions].sort(comparePredictionsNewestFirst);
  const globalRankById = new Map(
    sortedGlobal.map((p, index) => [p.id, index]),
  );

  const bySource = rollupBySource(predictions);
  const bySourcePredictions = groupPredictionsBySource(predictions);
  const sorted = sortLeaderboardRows(
    [...bySource.entries()].map(([source, rollup]) =>
      rowFromRollup(
        source,
        sourceSlugForSource(
          source,
          bySourcePredictions.get(source) ?? [],
          globalRankById,
        ),
        rollup,
      ),
    ),
  );

  const rankedCount = sorted.filter(r => r.scored > 0).length;
  const total = sorted.length;
  const displayStats = platformLeaderboardDisplayStats(sorted);
  const showFullRankings = shouldShowFullLeaderboardFromStats(displayStats);
  const rows = buildLeaderboardRows(
    sorted,
    offset,
    limit,
    bySourcePredictions,
    globalRankById,
  );

  return {
    rows,
    total,
    rankedCount,
    offset,
    limit,
    hasMore: offset + rows.length < total,
    displayStats,
    showFullRankings,
  };
}

/** Convenience wrapper returning only the row slice (home preview). */
export function computeLeaderboard(
  predictions: Prediction[],
  limit = 8,
): LeaderboardRow[] {
  return computeLeaderboardPage(predictions, { limit, offset: 0 }).rows;
}
