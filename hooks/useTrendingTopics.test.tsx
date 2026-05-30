import '@/test/mocks/api-service';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test } from 'vitest';
import { listTopics } from '@/test/mocks/api-service';
import { useTrendingTopics } from './useTrendingTopics';
import { TrendingTopicDto } from '@/services/api';

function trendingTopic(overrides: Partial<TrendingTopicDto> = {}): TrendingTopicDto {
  return {
    id: 't-1',
    slug: 'ai',
    name: 'AI',
    kind: 'curated',
    parentTopicIds: ['topic-tech'],
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
