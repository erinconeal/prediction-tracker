import type { Topic } from '@/types/topic';

export function buildTopic(overrides: Partial<Topic> = {}): Topic {
  return {
    id: 't-1',
    slug: 'general',
    name: 'General',
    kind: 'bucket',
    parentTopicIds: [],
    ...overrides,
  };
}

export const curatedAiTopic = buildTopic({
  id: 'topic-ai',
  slug: 'ai-regulation-2026',
  name: 'AI regulation 2026',
  kind: 'curated',
  parentTopicIds: ['topic-tech', 'topic-politics'],
});

export const parentTechTopic = buildTopic({
  id: 'topic-tech',
  slug: 'technology',
  name: 'Technology',
  kind: 'bucket',
  parentTopicIds: [],
});

export const parentPoliticsTopic = buildTopic({
  id: 'topic-politics',
  slug: 'politics',
  name: 'Politics',
  kind: 'bucket',
  parentTopicIds: [],
});
