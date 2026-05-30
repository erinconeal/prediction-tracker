import '@/test/mocks/api-service';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test } from 'vitest';
import { listTopics as listTopicsFromStore } from '@/lib/topic-store';
import { listTopics } from '@/test/mocks/api-service';
import {
  resetTopicCatalogCacheForTests,
  useTopicCatalog,
} from './useTopicCatalog';

describe('useTopicCatalog', () => {
  beforeEach(() => {
    listTopics.mockReset();
    resetTopicCatalogCacheForTests();
    listTopics.mockImplementation(async () => listTopicsFromStore());
  });

  test('given topic ids, should resolve topics synchronously from the topic store', () => {
    const { result } = renderHook(() => useTopicCatalog());

    expect(
      result.current.getTopicsByIds(['topic-ai-regulation-2026']).map(t => t.slug),
    ).toEqual(['ai-regulation-2026']);
  });

  test('given API catalog loads, should refresh topics list', async () => {
    listTopics.mockResolvedValue([
      {
        id: 'topic-ai-regulation-2026',
        slug: 'ai-regulation-2026',
        name: 'AI regulation 2026',
        kind: 'curated',
        parentTopicIds: ['topic-tech', 'topic-politics'],
      },
    ]);

    const { result } = renderHook(() => useTopicCatalog());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.topics.some(t => t.slug === 'ai-regulation-2026')).toBe(
      true,
    );
  });
});
