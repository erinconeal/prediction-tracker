import { comparePredictionsNewestFirst } from '@/lib/prediction-sort';
import { primaryBucketTopicForPrediction } from '@/lib/topic-store';
import type { Prediction } from '@/types/prediction';

import { POPULAR_FORECAST_MAX_SLOTS } from '@/lib/popular-forecast-columns';

/** Upper bound when the viewport fits four columns (xl). */
export const DEFAULT_POPULAR_FORECAST_COUNT = POPULAR_FORECAST_MAX_SLOTS;

/**
 * Picks hero “popular forecast” cards: newest first, preferring one row per
 * bucket topic before backfilling so the grid stays visually varied.
 */
export function pickPopularForecastsFromFeed(
  data: Prediction[],
  options: {
    max?: number;
    excludeIds?: Iterable<string>;
  } = {},
): Prediction[] {
  const max = options.max ?? DEFAULT_POPULAR_FORECAST_COUNT;
  if (data.length === 0 || max <= 0) return [];

  const exclude = new Set(options.excludeIds);
  const candidates = [...data]
    .filter(p => !exclude.has(p.id))
    .sort(comparePredictionsNewestFirst);

  const picked: Prediction[] = [];
  const seenBuckets = new Set<string>();

  for (const p of candidates) {
    if (picked.length >= max) break;
    const bucket = primaryBucketTopicForPrediction(p);
    const key = (bucket?.slug ?? 'other').toLowerCase();
    if (seenBuckets.has(key)) continue;
    seenBuckets.add(key);
    picked.push(p);
  }

  if (picked.length < max) {
    const pickedIds = new Set(picked.map(p => p.id));
    for (const p of candidates) {
      if (picked.length >= max) break;
      if (pickedIds.has(p.id)) continue;
      picked.push(p);
    }
  }

  return picked;
}
