import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import * as api from '@/services/api';
import { useTrendingTopics } from './useTrendingTopics';
import { TrendingTopicDto } from '@/services/api';

vi.mock('@/services/api', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/services/api')>();
  return {
    ...mod,
    listTopics: vi.fn(),
  };
});

const listTopics = vi.mocked(api.listTopics);

function trendingTopic(overrides: Partial<TrendingTopicDto> = {}): TrendingTopicDto {
  return {
    id: 't-1',
    slug: 'ai',
    name: 'AI',
    categories: ['Tech'],
    count: 1,
    recentCount: 0,
    ...overrides,
  };
}

describe('useTrendingTopics', () => {
  beforeEach(() => {
    listTopics.mockReset();
  });

  test('given enabled false, should not call listTopics and report not loading', async () => {
    const { result } = renderHook(() => useTrendingTopics({ enabled: false }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(listTopics).not.toHaveBeenCalled();
    expect(result.current.data).toEqual([]);
  });

  test ('given enabled true, should load trending topics', async () => {
    listTopics.mockResolvedValue([trendingTopic()]);
    const { result } = renderHook(() => useTrendingTopics({ limit: 6 }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(listTopics).toHaveBeenCalledWith(
      expect.objectContaining({ trending: true, limit: 6 }),
    );
    expect(result.current.data).toHaveLength(1);
  });
});
