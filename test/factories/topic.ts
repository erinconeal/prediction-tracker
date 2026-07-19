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
  id: 'topic-ai-regulation-2026',
  slug: 'ai-regulation-2026',
  name: 'AI regulation 2026',
  kind: 'curated',
  parentTopicIds: ['topic-tech', 'topic-politics'],
});

export const curatedHousingTopic = buildTopic({
  id: 'topic-housing-market-2026',
  slug: 'housing-market-2026',
  name: 'Housing market 2026',
  kind: 'curated',
  parentTopicIds: ['topic-finance'],
});

export const curatedMidtermTopic = buildTopic({
  id: 'topic-midterm-elections-2026',
  slug: 'midterm-elections-2026',
  name: 'Midterm elections 2026',
  kind: 'curated',
  parentTopicIds: ['topic-politics'],
});

export const parentTechTopic = buildTopic({
  id: 'topic-tech',
  slug: 'tech',
  name: 'Tech',
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

export const parentFinanceTopic = buildTopic({
  id: 'topic-finance',
  slug: 'finance',
  name: 'Finance',
  kind: 'bucket',
  parentTopicIds: [],
});
