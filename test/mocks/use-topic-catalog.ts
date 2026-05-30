import { getTopicsByIds } from '@/lib/topic-store';
import { pickPrimaryTopicFromLinked } from '@/lib/topic-primary';
import type { Topic } from '@/types/topic';
import { vi } from 'vitest';

const catalogMocks = vi.hoisted(() => ({
  getParentBucketTopicsOverride: null as ((topic: Topic) => Topic[]) | null,
}));

function defaultGetPrimaryTopicForPrediction(ids: string[]) {
  return pickPrimaryTopicFromLinked(getTopicsByIds(ids));
}

function defaultGetParentBucketTopics(topic: Topic) {
  if (topic.kind !== 'curated') return [];
  return getTopicsByIds(topic.parentTopicIds).filter(t => t.kind === 'bucket');
}

function getPrimaryTopicForPrediction(ids: string[]) {
  return defaultGetPrimaryTopicForPrediction(ids);
}

function getParentBucketTopics(topic: Topic) {
  if (catalogMocks.getParentBucketTopicsOverride) {
    return catalogMocks.getParentBucketTopicsOverride(topic);
  }
  return defaultGetParentBucketTopics(topic);
}

export const topicCatalogMockValue = {
  topics: [] as Topic[],
  loading: false,
  getTopicsByIds,
  getPrimaryTopicForPrediction,
  getParentBucketTopics,
};

export function setMockGetParentBucketTopics(
  fn: (topic: Topic) => Topic[],
) {
  catalogMocks.getParentBucketTopicsOverride = fn;
}

export function resetTopicCatalogMockForTests() {
  catalogMocks.getParentBucketTopicsOverride = null;
  topicCatalogMockValue.topics = [];
  topicCatalogMockValue.loading = false;
}

vi.mock('@/hooks/useTopicCatalog', () => ({
  useTopicCatalog: () => topicCatalogMockValue,
}));
