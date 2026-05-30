import { beforeEach, describe, expect, test } from 'vitest';
import { curatedAiTopic, parentTechTopic } from '@/test/factories/topic';
import {
  resetTopicCatalogMockForTests,
  setMockGetParentBucketTopics,
  topicCatalogMockValue,
} from './use-topic-catalog';

describe('use-topic-catalog mock', () => {
  beforeEach(() => {
    resetTopicCatalogMockForTests();
  });

  test('given curated prediction topic ids, getPrimaryTopicForPrediction should resolve via topic store', () => {
    const primary = topicCatalogMockValue.getPrimaryTopicForPrediction([
      'topic-ai-regulation-2026',
    ]);

    expect(primary?.slug).toBe('ai-regulation-2026');
  });

  test('given setMockGetParentBucketTopics override, getParentBucketTopics should use override', () => {
    setMockGetParentBucketTopics(() => [parentTechTopic]);

    expect(topicCatalogMockValue.getParentBucketTopics(curatedAiTopic)).toEqual([
      parentTechTopic,
    ]);
  });

  test('given resetTopicCatalogMockForTests, getParentBucketTopics should restore default behavior', () => {
    setMockGetParentBucketTopics(() => []);

    resetTopicCatalogMockForTests();

    const buckets = topicCatalogMockValue.getParentBucketTopics(curatedAiTopic);
    expect(buckets.map(t => t.slug)).toEqual(['tech', 'politics']);
  });
});
