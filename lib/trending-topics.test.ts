import { describe, expect, test } from 'vitest';
import type { Prediction } from '@/types/prediction';
import type { Topic } from '@/types/topic';
import { rankTrendingTopics } from './trending-topics';

function topic(
  id: string,
  slug: string,
  parentTopicIds: string[] = ['topic-tech'],
): Topic {
  return { id, slug, name: slug, kind: 'curated', parentTopicIds };
}

function row(
  topicIds: string[],
  created_at: string,
): Prediction {
  return {
    id: 'x',
    source: 'S',
    sourceSlug: 's',
    text: 't',
    topicIds,
    created_at,
    resolved_at: null,
    target_date: null,
    outcome: 'pending',
  };
}

describe('rankTrendingTopics', () => {
  const now = Date.parse('2024-06-15T12:00:00.000Z');
  const tA = topic('t-a', 'topic-a');
  const tB = topic('t-b', 'topic-b', ['topic-finance']);

  test('ranks by recent count then total count', () => {
    const predictions = [
      row(['t-a'], '2024-06-14T00:00:00.000Z'),
      row(['t-a'], '2024-06-13T00:00:00.000Z'),
      row(['t-b'], '2024-06-14T00:00:00.000Z'),
      row(['t-b'], '2024-01-01T00:00:00.000Z'),
      row(['t-b'], '2024-01-02T00:00:00.000Z'),
      row(['t-b'], '2024-01-03T00:00:00.000Z'),
    ];

    const ranked = rankTrendingTopics([tA, tB], predictions, { now });
    expect(ranked[0]?.topic.id).toBe('t-a');
    expect(ranked[0]?.recentCount).toBe(2);
    expect(ranked[1]?.topic.id).toBe('t-b');
    expect(ranked[1]?.recentCount).toBe(1);
    expect(ranked[1]?.count).toBe(4);
  });

  test('ignores unknown topic ids', () => {
    const ranked = rankTrendingTopics(
      [tA],
      [row(['unknown'], '2024-06-14T00:00:00.000Z')],
      { now },
    );
    expect(ranked).toHaveLength(0);
  });
});
