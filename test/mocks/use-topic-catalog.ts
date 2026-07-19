import type { Topic } from '@/types/topic';
import { pickPrimaryTopicFromLinked } from '@/lib/topic-primary';
import {
  curatedAiTopic,
  curatedHousingTopic,
  curatedMidtermTopic,
  parentFinanceTopic,
  parentPoliticsTopic,
  parentTechTopic,
} from '@/test/factories/topic';
import { vi } from 'vitest';

const TOPIC_BY_ID = new Map<string, Topic>([
  [curatedAiTopic.id, curatedAiTopic],
  [curatedHousingTopic.id, curatedHousingTopic],
  [curatedMidtermTopic.id, curatedMidtermTopic],
  [parentTechTopic.id, parentTechTopic],
  [parentPoliticsTopic.id, parentPoliticsTopic],
  [parentFinanceTopic.id, parentFinanceTopic],
]);

const catalogMocks = vi.hoisted(() => ({
  getParentBucketTopicsOverride: null as ((topic: Topic) => Topic[]) | null,
}));

function syncGetTopicsByIds(ids: string[]): Topic[] {
  return ids.map(id => TOPIC_BY_ID.get(id)).filter((t): t is Topic => t !== undefined);
}

function syncGetPrimaryTopicForPrediction(ids: string[]) {
  return pickPrimaryTopicFromLinked(syncGetTopicsByIds(ids));
}

function syncGetParentBucketTopics(topic: Topic): Topic[] {
  if (catalogMocks.getParentBucketTopicsOverride) {
    return catalogMocks.getParentBucketTopicsOverride(topic);
  }
  if (topic.kind !== 'curated') return [];
  return syncGetTopicsByIds(topic.parentTopicIds).filter(t => t.kind === 'bucket');
}

export const topicCatalogMockValue = {
  topics: [...TOPIC_BY_ID.values()],
  loading: false,
  getTopicsByIds: (ids: string[]) => Promise.resolve(syncGetTopicsByIds(ids)),
  getPrimaryTopicForPrediction: (ids: string[]) => Promise.resolve(syncGetPrimaryTopicForPrediction(ids)),
  getParentBucketTopics: (topic: Topic) => Promise.resolve(syncGetParentBucketTopics(topic)),
};

export function setMockGetParentBucketTopics(
  fn: (topic: Topic) => Topic[],
) {
  catalogMocks.getParentBucketTopicsOverride = fn;
}

export function resetTopicCatalogMockForTests() {
  catalogMocks.getParentBucketTopicsOverride = null;
  topicCatalogMockValue.topics = [...TOPIC_BY_ID.values()];
  topicCatalogMockValue.loading = false;
}

vi.mock('@/hooks/useTopicCatalog', () => ({
  useTopicCatalog: () => topicCatalogMockValue,
}));
