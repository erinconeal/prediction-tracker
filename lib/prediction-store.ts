import type {
  CreatePredictionInput,
  Outcome,
  Prediction,
  PredictionListSort,
  TerminalOutcome,
} from '@/types/prediction';
import { comparePredictionsNewestFirst } from '@/lib/prediction-sort';
import { isStillOpenOutcome } from '@/lib/prediction-outcome';
import { predictionMatchesTopicSlug } from '@/lib/prediction-topic-match';
import {
  accuracyPercentFromRollup,
  rollupBySource,
} from '@/lib/source-outcome-rollup';
import { getTopicBySlug } from '@/lib/topic-store';
import { slugify } from '@/utils/slugify';

export type ListPredictionsFilter = {
  source?: string;
  status?: Outcome;
  /** Topic slug filter (bucket roll-up or curated exact match). */
  topic?: string;
  limit?: number;
  offset?: number;
  sort?: PredictionListSort;
};

const predictions: Prediction[] = [];

function tid(slug: string): string {
  const t = getTopicBySlug(slug);
  if (!t) throw new Error(`seed topic missing: ${slug}`);
  return t.id;
}

function seed(): void {
  if (predictions.length > 0) return;
  const now = new Date();
  const iso = (d: Date) => d.toISOString();

  const samples: CreatePredictionInput[] = [
    {
      source: 'Jane Analyst',
      text: 'Inflation will stay above 2% through Q4.',
      topicIds: [tid('sp-hits-8000'), tid('housing-market-2026')],
      target_date: '2026-12-31',
    },
    {
      source: 'Tech Blogger',
      text: 'Vendor X ships the new chip before June.',
      topicIds: [tid('ai-regulation-2026')],
      target_date: '2026-06-01',
    },
    {
      source: 'Jane Analyst',
      text: 'Unemployment dips below 4% this year.',
      topicIds: [tid('housing-market-2026')],
    },
    {
      source: 'Jane Analyst',
      text: 'The Fed cuts rates at least twice before year-end.',
      topicIds: [tid('fed-independence-2027')],
    },
    {
      source: 'Political Pundit',
      text: 'Democrats hold the Senate in 2026 midterms.',
      topicIds: [tid('midterm-elections-2026')],
      target_date: '2026-11-01',
    },
    {
      source: 'Sports Analyst',
      text: 'Brazil wins the 2026 World Cup.',
      topicIds: [tid('world-cup-2026-winner')],
      target_date: '2026-07-01',
    },
    {
      source: 'Climate Writer',
      text: 'At least four Atlantic hurricanes reach Category 3 in 2026.',
      topicIds: [tid('atlantic-hurricane-season-2026')],
    },
    {
      source: 'History Buff',
      text: 'A 1930s-style depression begins before 2028.',
      topicIds: [tid('great-depression-analog')],
    },
    {
      source: 'Tech Blogger',
      text: 'Still open: EV share of new US sales exceeds 25% by 2027.',
      topicIds: [tid('ev-adoption-2030')],
      target_date: '2027-06-01',
    },
  ];

  samples.forEach((input, i) => {
    predictions.push(
      createInternal(input, iso(new Date(now.getTime() + i * 1000))),
    );
  });

  predictions[0]!.outcome = 'correct';
  predictions[1]!.outcome = 'incorrect';
  predictions[2]!.outcome = 'correct';
  predictions[0]!.finished_at = iso(new Date(now.getTime() - 1 * 3600000));
  predictions[1]!.finished_at = iso(new Date(now.getTime() - 2 * 3600000));
  predictions[2]!.finished_at = iso(new Date(now.getTime() - 3 * 3600000));
  predictions[3]!.outcome = 'unresolved';
  predictions[3]!.finished_at = iso(new Date(now.getTime() - 4 * 3600000));
}

function createInternal(
  input: CreatePredictionInput,
  createdAtIso: string,
): Prediction {
  const sourceSlug = slugify(input.source);
  const topicIds = input.topicIds ?? [];

  return {
    id: crypto.randomUUID(),
    source: input.source.trim(),
    sourceSlug,
    text: input.text.trim(),
    topicIds: [...topicIds],
    created_at: createdAtIso,
    finished_at: null,
    target_date: input.target_date?.trim()
      ? normalizeTargetDate(input.target_date.trim())
      : null,
    outcome: 'still_open',
  };
}

function normalizeTargetDate(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00.000Z`).toISOString();
  }
  return new Date(value).toISOString();
}

function matchesSource(p: Prediction, source: string): boolean {
  const s = source.trim().toLowerCase();
  return (
    p.source.toLowerCase() === s
    || p.sourceSlug === s
    || p.sourceSlug === slugify(source)
  );
}

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
 * Filtered and sorted view of the store, without pagination.
 * Used by listPredictions and by leaderboard aggregation (default sort newest).
 */
export function filterAndSortPredictions(
  filter: Pick<
    ListPredictionsFilter,
    'source' | 'status' | 'topic' | 'sort'
  > = {},
): Prediction[] {
  seed();
  const sort = filter.sort ?? 'newest';
  const filtered = predictions.filter((p) => {
    if (filter.source && !matchesSource(p, filter.source)) return false;
    if (filter.status && p.outcome !== filter.status) return false;
    if (filter.topic && !predictionMatchesTopicSlug(p, filter.topic)) {
      return false;
    }
    return true;
  });
  return sortFiltered(filtered, sort);
}

/**
 * Read path for the in-memory store: filter, sort, then slice
 * for pagination (`limit` default 50 max 100, `offset` default 0).
 */
export function listPredictions(filter: ListPredictionsFilter = {}): Prediction[] {
  const { limit: rawLimit, offset: rawOffset, ...rest } = filter;
  const all = filterAndSortPredictions(rest);
  const limit = Math.min(Math.max(1, rawLimit ?? 50), 100);
  const offset = Math.max(0, rawOffset ?? 0);
  return all.slice(offset, offset + limit);
}

export function getPredictionById(id: string): Prediction | null {
  seed();
  return predictions.find(p => p.id === id) ?? null;
}

export function createPrediction(input: CreatePredictionInput): Prediction {
  seed();
  const row = createInternal(input, new Date().toISOString());
  predictions.push(row);
  return row;
}

export function updatePredictionOutcome(
  id: string,
  outcome: TerminalOutcome,
): Prediction | null {
  seed();
  const row = predictions.find(p => p.id === id);
  if (!row) return null;
  if (row.outcome === outcome) return row;
  row.outcome = outcome;
  row.finished_at = new Date().toISOString();
  return row;
}
