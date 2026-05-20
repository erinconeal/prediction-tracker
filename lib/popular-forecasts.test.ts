import { describe, expect, test } from 'vitest';
import type { Prediction } from '@/types/prediction';
import { pickPopularForecastsFromFeed } from './popular-forecasts';

function prediction(
  id: string,
  category: string | null,
  createdAt: string,
): Prediction {
  return {
    id,
    source: 'Source',
    sourceSlug: 'source',
    text: `Prediction ${id}`,
    category,
    topicIds: [],
    created_at: createdAt,
    resolved_at: null,
    target_date: null,
    outcome: 'pending',
  };
}

describe('pickPopularForecastsFromFeed', () => {
  test('prefers one forecast per category before backfilling', () => {
    const data = [
      prediction('a', 'Finance', '2024-06-03T00:00:00.000Z'),
      prediction('b', 'Finance', '2024-06-02T00:00:00.000Z'),
      prediction('c', 'Tech', '2024-06-01T00:00:00.000Z'),
      prediction('d', 'Politics', '2024-05-31T00:00:00.000Z'),
    ];

    const picked = pickPopularForecastsFromFeed(data, { max: 3 });

    expect(picked.map(p => p.id)).toEqual(['a', 'c', 'd']);
  });

  test('excludes ids when requested', () => {
    const data = [
      prediction('a', 'Finance', '2024-06-03T00:00:00.000Z'),
      prediction('b', 'Tech', '2024-06-02T00:00:00.000Z'),
    ];

    const picked = pickPopularForecastsFromFeed(data, {
      max: 2,
      excludeIds: ['a'],
    });

    expect(picked.map(p => p.id)).toEqual(['b']);
  });

  test('given empty feed, should return no picks', () => {
    expect(pickPopularForecastsFromFeed([], { max: 4 })).toEqual([]);
  });

  test('given max zero, should return no picks', () => {
    const data = [prediction('a', 'Finance', '2024-06-03T00:00:00.000Z')];
    expect(pickPopularForecastsFromFeed(data, { max: 0 })).toEqual([]);
  });

  test('given only one category, should backfill to max', () => {
    const data = [
      prediction('a', 'Finance', '2024-06-03T00:00:00.000Z'),
      prediction('b', 'Finance', '2024-06-02T00:00:00.000Z'),
      prediction('c', 'Finance', '2024-06-01T00:00:00.000Z'),
    ];
    expect(pickPopularForecastsFromFeed(data, { max: 3 }).map(p => p.id)).toEqual([
      'a',
      'b',
      'c',
    ]);
  });
});
