import { comparePredictionsNewestFirst } from '@/lib/prediction-sort';
import type { Prediction } from '@/types/prediction';

import { FEATURED_FORECAST_MAX_SLOTS } from '@/lib/featured-forecast-columns';

/** Upper bound when the viewport fits four columns (xl). */
export const DEFAULT_POPULAR_FORECAST_COUNT = FEATURED_FORECAST_MAX_SLOTS;

/**
 * Picks hero “popular forecast” cards: newest first, preferring one row per
 * category before backfilling so the grid stays visually varied.
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
  const seenCategories = new Set<string>();

  for (const p of candidates) {
    if (picked.length >= max) break;
    const key = (p.category?.trim() || 'Other').toLowerCase();
    if (seenCategories.has(key)) continue;
    seenCategories.add(key);
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
