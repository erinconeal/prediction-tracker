import type { Prediction, PredictionListSort, Outcome } from '@/types/prediction';
import { slugify } from '@/utils/slugify';
import { comparePredictionsNewestFirst } from '@/lib/prediction-sort';
import { predictionMatchesTopicWithCatalog } from '@/lib/prediction-topic-match';
import { isStillOpenOutcome } from '@/lib/prediction-outcome';
import {
  accuracyPercentFromRollup,
  rollupBySource,
} from '@/lib/source-outcome-rollup';
import { getTopicBySlug, getTopicsByIds } from '@/lib/repositories/topic-repository';

type SourceSortKey = {
  accuracyPercent: number | null;
  scored: number;
  total: number;
};

function sourceSortKeyMap(filtered: Prediction[]): Map<string, SourceSortKey> {
  const by = rollupBySource(filtered);
  const out = new Map<string, SourceSortKey>();
  for (const [source, rollup] of by) {
    out.set(source, {
      accuracyPercent: accuracyPercentFromRollup(rollup),
      scored: rollup.scored,
      total: rollup.total,
    });
  }
  return out;
}

function compareBySourceAccuracy(
  a: Prediction,
  b: Prediction,
  keys: Map<string, SourceSortKey>,
): number {
  const ka = keys.get(a.source);
  const kb = keys.get(b.source);
  if (!ka || !kb) return comparePredictionsNewestFirst(a, b);
  const ar = ka.accuracyPercent ?? -1;
  const br = kb.accuracyPercent ?? -1;
  if (br !== ar) return br - ar;
  if (kb.scored !== ka.scored) return kb.scored - ka.scored;
  if (kb.total !== ka.total) return kb.total - ka.total;
  return comparePredictionsNewestFirst(a, b);
}

function compareRecentlyFinished(a: Prediction, b: Prediction): number {
  const aStillOpen = isStillOpenOutcome(a.outcome);
  const bStillOpen = isStillOpenOutcome(b.outcome);
  if (aStillOpen !== bStillOpen) return aStillOpen ? 1 : -1;
  if (!aStillOpen && !bStillOpen) {
    const ra = a.finished_at
      ? new Date(a.finished_at).getTime()
      : Number.NEGATIVE_INFINITY;
    const rb = b.finished_at
      ? new Date(b.finished_at).getTime()
      : Number.NEGATIVE_INFINITY;
    const t = rb - ra;
    if (t !== 0) return t;
    return b.id.localeCompare(a.id);
  }
  return comparePredictionsNewestFirst(a, b);
}

function matchesSource(p: Prediction, source: string): boolean {
  const s = source.trim().toLowerCase();
  return (
    p.source.toLowerCase() === s
    || p.sourceSlug === s
    || p.sourceSlug === slugify(source)
  );
}

function sortFiltered(
  filtered: Prediction[],
  sort: PredictionListSort,
): Prediction[] {
  const copy = [...filtered];
  if (sort === 'newest') {
    return copy.sort(comparePredictionsNewestFirst);
  }
  if (sort === 'source_accuracy') {
    const keys = sourceSortKeyMap(filtered);
    return copy.sort((a, b) => compareBySourceAccuracy(a, b, keys));
  }
  return copy.sort(compareRecentlyFinished);
}

/**
 * Filtered and sorted prediction list (no pagination).
 * Used by list/leaderboard/topic API routes (default sort: newest).
 */
export async function filterAndSortPredictions(
  predictions: Prediction[],
  filter: {
    source?: string;
    status?: Outcome;
    topic?: string;
    sort?: PredictionListSort;
  } = {},
): Promise<Prediction[]> {
  const sort = filter.sort ?? 'newest';
  let filtered = predictions;
  if (filter.source) {
    const source = filter.source;
    filtered = filtered.filter(p => matchesSource(p, source));
  }
  if (filter.status) {
    filtered = filtered.filter(p => p.outcome === filter.status);
  }
  if (filter.topic) {
    const topic = await getTopicBySlug(filter.topic);
    if (!topic) {
      filtered = [];
    }
    else {
      const linkedIds = [...new Set(filtered.flatMap(p => p.topicIds))];
      const linked = await getTopicsByIds(linkedIds);
      const topicById = new Map(linked.map(t => [t.id, t]));
      filtered = filtered.filter(p =>
        predictionMatchesTopicWithCatalog(p, topic, topicById),
      );
    }
  }
  return sortFiltered(filtered, sort);
}

export function paginatePredictions(
  rows: Prediction[],
  { limit = 50, offset = 0 } = {},
): Prediction[] {
  const lim = Math.min(Math.max(1, limit), 100);
  const off = Math.max(0, offset);
  return rows.slice(off, off + lim);
}
