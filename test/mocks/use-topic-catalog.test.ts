import { beforeEach, describe, expect, test } from 'vitest';
import { curatedAiTopic, parentPoliticsTopic, parentTechTopic } from '@/test/factories/topic';
import {
  resetTopicCatalogMockForTests,
  setMockGetParentBucketTopics,
  topicCatalogMockValue,
} from './use-topic-catalog';

describe('use-topic-catalog mock', () => {
  beforeEach(() => {
    resetTopicCatalogMockForTests();
  });

  test('given curated prediction topic ids, getPrimaryTopicForPrediction should resolve via topic store', async () => {
    const primary = await topicCatalogMockValue.getPrimaryTopicForPrediction([
      'topic-ai-regulation-2026',
    ]);

    expect(primary?.slug).toBe('ai-regulation-2026');
  });

  test('given setMockGetParentBucketTopics override, getParentBucketTopics should use override', async () => {
    setMockGetParentBucketTopics(() => [parentTechTopic]);

    expect(await topicCatalogMockValue.getParentBucketTopics(curatedAiTopic)).toEqual([
      parentTechTopic,
    ]);
  });

  test('given resetTopicCatalogMockForTests, getParentBucketTopics should restore default behavior', async () => {
    setMockGetParentBucketTopics(() => []);

    resetTopicCatalogMockForTests();

    const buckets = await topicCatalogMockValue.getParentBucketTopics(curatedAiTopic);
    expect(buckets.map(t => t.slug)).toEqual([
      parentTechTopic.slug,
      parentPoliticsTopic.slug,
    ]);
  });
});
