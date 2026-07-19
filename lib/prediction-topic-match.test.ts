import { describe, expect, test } from 'vitest';
import type { Prediction } from '@/types/prediction';
import { listTopics } from '@/lib/repositories/topic-repository';
import {
  predictionMatchesTopicSlug,
  predictionMatchesTopicWithCatalog,
} from './prediction-topic-match';

function base(overrides: Partial<Prediction> = {}): Prediction {
  return {
    id: '1',
    source: 'S',
    sourceSlug: 's',
    text: 't',
    topicIds: [],
    created_at: '2024-01-01T00:00:00.000Z',
    finished_at: null,
    target_date: null,
    outcome: 'still_open',
    ...overrides,
  };
}

describe('predictionMatchesTopicSlug', () => {
  test('given unknown topic slug, should not match', async () => {
    expect(await predictionMatchesTopicSlug(base(), 'not-a-real-topic')).toBe(false);
  });

  test('given linked curated topic slug, should match', async () => {
    const ai = (await listTopics()).find(t => t.slug === 'ai-regulation-2026');
    expect(ai).toBeDefined();
    expect(
      await predictionMatchesTopicSlug(
        base({ topicIds: [ai!.id] }),
        'ai-regulation-2026',
      ),
    ).toBe(true);
  });

  test('given bucket slug, should match via curated parent roll-up', async () => {
    const ai = (await listTopics()).find(t => t.slug === 'ai-regulation-2026');
    expect(ai).toBeDefined();
    expect(
      await predictionMatchesTopicSlug(
        base({ topicIds: [ai!.id] }),
        'politics',
      ),
    ).toBe(true);
  });

  test('given bucket slug with direct bucket link, should match', async () => {
    const tech = (await listTopics()).find(t => t.slug === 'tech');
    expect(tech).toBeDefined();
    expect(
      await predictionMatchesTopicSlug(
        base({ topicIds: [tech!.id] }),
        'tech',
      ),
    ).toBe(true);
  });
});

describe('predictionMatchesTopicWithCatalog', () => {
  test('given preloaded catalog, should match bucket via curated parent without extra IO', async () => {
    const topics = await listTopics();
    const ai = topics.find(t => t.slug === 'ai-regulation-2026');
    const politics = topics.find(t => t.slug === 'politics');
    expect(ai).toBeDefined();
    expect(politics).toBeDefined();

    const topicById = new Map(topics.map(t => [t.id, t]));
    expect(
      predictionMatchesTopicWithCatalog(
        base({ topicIds: [ai!.id] }),
        politics!,
        topicById,
      ),
    ).toBe(true);
  });
});
