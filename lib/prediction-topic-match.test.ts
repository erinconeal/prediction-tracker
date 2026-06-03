import { describe, expect, test } from 'vitest';
import type { Prediction } from '@/types/prediction';
import { listTopics } from '@/lib/topic-store';
import { predictionMatchesTopicSlug } from './prediction-topic-match';

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
  test('given unknown topic slug, should not match', () => {
    expect(predictionMatchesTopicSlug(base(), 'not-a-real-topic')).toBe(false);
  });

  test('given linked curated topic slug, should match', () => {
    const ai = listTopics().find(t => t.slug === 'ai-regulation-2026');
    expect(ai).toBeDefined();
    expect(
      predictionMatchesTopicSlug(
        base({ topicIds: [ai!.id] }),
        'ai-regulation-2026',
      ),
    ).toBe(true);
  });

  test('given bucket slug, should match via curated parent roll-up', () => {
    const ai = listTopics().find(t => t.slug === 'ai-regulation-2026');
    expect(ai).toBeDefined();
    expect(
      predictionMatchesTopicSlug(
        base({ topicIds: [ai!.id] }),
        'politics',
      ),
    ).toBe(true);
  });

  test('given bucket slug with direct bucket link, should match', () => {
    const tech = listTopics().find(t => t.slug === 'tech');
    expect(tech).toBeDefined();
    expect(
      predictionMatchesTopicSlug(
        base({ topicIds: [tech!.id] }),
        'tech',
      ),
    ).toBe(true);
  });
});
