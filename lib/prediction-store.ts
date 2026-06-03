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

function applySeedOutcome(
  index: number,
  outcome: TerminalOutcome,
  hoursAgo: number,
  now: Date,
  iso: (d: Date) => string,
): void {
  const row = predictions[index]!;
  row.outcome = outcome;
  row.finished_at = iso(new Date(now.getTime() - hoursAgo * 3600000));
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
    {
      source: 'Jane Analyst',
      text: 'Core CPI cools below 3% before September.',
      topicIds: [tid('sp-hits-8000')],
    },
    {
      source: 'Jane Analyst',
      text: 'Mortgage rates fall below 6% this year.',
      topicIds: [tid('housing-market-2026')],
    },
    {
      source: 'Jane Analyst',
      text: 'Payrolls growth slows for three straight months.',
      topicIds: [tid('housing-market-2026')],
    },
    {
      source: 'Tech Blogger',
      text: 'Major cloud vendor announces on-device AI chips.',
      topicIds: [tid('ai-regulation-2026')],
    },
    {
      source: 'Tech Blogger',
      text: 'Open-source model beats proprietary benchmark on coding tasks.',
      topicIds: [tid('ai-regulation-2026')],
    },
    {
      source: 'Political Pundit',
      text: 'Governor race flips in a Sun Belt state.',
      topicIds: [tid('midterm-elections-2026')],
    },
    {
      source: 'Sports Analyst',
      text: 'France reaches the World Cup final.',
      topicIds: [tid('world-cup-2026-winner')],
    },
    {
      source: 'Climate Writer',
      text: 'Global temperature record broken again in 2026.',
      topicIds: [tid('atlantic-hurricane-season-2026')],
    },
  ];

  samples.forEach((input, i) => {
    predictions.push(
      createInternal(input, iso(new Date(now.getTime() + i * 1000))),
    );
  });

  // Jane Analyst — 5 scored (4 correct, 1 incorrect); newest three correct for streak
  applySeedOutcome(0, 'incorrect', 50, now, iso);
  applySeedOutcome(2, 'correct', 40, now, iso);
  applySeedOutcome(9, 'correct', 12, now, iso);
  applySeedOutcome(10, 'correct', 8, now, iso);
  applySeedOutcome(11, 'correct', 4, now, iso);
  predictions[3]!.outcome = 'unresolved';
  predictions[3]!.finished_at = iso(new Date(now.getTime() - 35 * 3600000));

  // Tech Blogger — 3 scored (2 correct, 1 incorrect); index 8 stays still_open
  applySeedOutcome(1, 'incorrect', 45, now, iso);
  applySeedOutcome(12, 'correct', 20, now, iso);
  applySeedOutcome(13, 'correct', 15, now, iso);

  // Political Pundit — 2 scored (1 correct, 1 incorrect)
  applySeedOutcome(4, 'correct', 30, now, iso);
  applySeedOutcome(14, 'incorrect', 25, now, iso);

  // Sports Analyst — 2 scored (1 correct, 1 incorrect)
  applySeedOutcome(5, 'correct', 28, now, iso);
  applySeedOutcome(15, 'incorrect', 22, now, iso);

  // Climate Writer — 2 scored (1 correct, 1 incorrect)
  applySeedOutcome(6, 'correct', 26, now, iso);
  applySeedOutcome(16, 'incorrect', 18, now, iso);

  // History Buff — 1 scored (incorrect keeps Jane as accuracy leader)
  applySeedOutcome(7, 'incorrect', 32, now, iso);
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
