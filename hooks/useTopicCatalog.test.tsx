import '@/test/mocks/api-service';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test } from 'vitest';
import { listTopics } from '@/test/mocks/api-service';
import {
  curatedAiTopic,
  parentPoliticsTopic,
  parentTechTopic,
} from '@/test/factories/topic';
import {
  resetTopicCatalogCacheForTests,
  useTopicCatalog,
} from './useTopicCatalog';

const catalogFixture = [curatedAiTopic, parentTechTopic, parentPoliticsTopic];

describe('useTopicCatalog', () => {
  beforeEach(() => {
    listTopics.mockReset();
    resetTopicCatalogCacheForTests();
    listTopics.mockResolvedValue(catalogFixture);
  });

  test('given topic ids, should resolve topics from the API catalog', async () => {
    const { result } = renderHook(() => useTopicCatalog());

    await expect(
      result.current.getTopicsByIds(['topic-ai-regulation-2026']),
    ).resolves.toEqual([
      expect.objectContaining({ slug: 'ai-regulation-2026' }),
    ]);
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

  test('given catalog fetch fails then a later request succeeds, should expose topics to subscribers', async () => {
    listTopics
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValue(catalogFixture);

    const { unmount } = renderHook(() => useTopicCatalog());

    await waitFor(() => {
      expect(listTopics).toHaveBeenCalledTimes(1);
    });

    unmount();

    const { result } = renderHook(() => useTopicCatalog());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(
        result.current.topics.some(t => t.slug === 'ai-regulation-2026'),
      ).toBe(true);
    });

    expect(listTopics).toHaveBeenCalledTimes(2);
  });
});
