import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { listTopics as listTopicsFromStore } from '@/lib/topic-store';
import * as api from '@/services/api';
import {
  resetTopicCatalogCacheForTests,
  useTopicCatalog,
} from './useTopicCatalog';

vi.mock('@/services/api', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/services/api')>();
  return {
    ...mod,
    listTopics: vi.fn(),
  };
});

const listTopics = vi.mocked(api.listTopics);

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
