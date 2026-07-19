import { describe, expect, test } from 'vitest';
import { buildPredictionWithId } from '@/test/factories/prediction';
import { pickPopularForecastsFromFeed } from './popular-forecasts';
import { buildTopic } from '@/test/factories/topic';

function prediction(
  id: string,
  topicIds: string[],
  createdAt: string,
) {
  return buildPredictionWithId(id, { topicIds, created_at: createdAt });
}

describe('pickPopularForecastsFromFeed', () => {
  const topicById = new Map([
    ['topic-finance', buildTopic({ id: 'topic-finance', slug: 'finance', kind: 'bucket' })],
    ['topic-tech', buildTopic({ id: 'topic-tech', slug: 'tech', kind: 'bucket' })],
    ['topic-politics', buildTopic({ id: 'topic-politics', slug: 'politics', kind: 'bucket' })],
  ]);

  test('prefers one forecast per bucket topic before backfilling', () => {
    const data = [
      prediction('a', ['topic-finance'], '2024-06-03T00:00:00.000Z'),
      prediction('b', ['topic-finance'], '2024-06-02T00:00:00.000Z'),
      prediction('c', ['topic-tech'], '2024-06-01T00:00:00.000Z'),
      prediction('d', ['topic-politics'], '2024-05-31T00:00:00.000Z'),
    ];

    const picked = pickPopularForecastsFromFeed(data, topicById, { max: 3 });

    expect(picked.map(p => p.id)).toEqual(['a', 'c', 'd']);
  });

  test('excludes ids when requested', () => {
    const data = [
      prediction('a', ['topic-finance'], '2024-06-03T00:00:00.000Z'),
      prediction('b', ['topic-tech'], '2024-06-02T00:00:00.000Z'),
    ];

    const picked = pickPopularForecastsFromFeed(data, topicById, {
      max: 2,
      excludeIds: ['a'],
    });

    expect(picked.map(p => p.id)).toEqual(['b']);
  });

  test('given empty feed, should return no picks', () => {
    expect(pickPopularForecastsFromFeed([], topicById, { max: 4 })).toEqual([]);
  });

  test('given max zero, should return no picks', () => {
    const data = [prediction('a', ['topic-finance'], '2024-06-03T00:00:00.000Z')];
    expect(pickPopularForecastsFromFeed(data, topicById, { max: 0 })).toEqual([]);
  });

  test('given only one bucket, should backfill to max', () => {
    const data = [
      prediction('a', ['topic-finance'], '2024-06-03T00:00:00.000Z'),
      prediction('b', ['topic-finance'], '2024-06-02T00:00:00.000Z'),
      prediction('c', ['topic-finance'], '2024-06-01T00:00:00.000Z'),
    ];
    expect(pickPopularForecastsFromFeed(data, topicById, { max: 3 }).map(p => p.id)).toEqual([
      'a',
      'b',
      'c',
    ]);
  });
});
