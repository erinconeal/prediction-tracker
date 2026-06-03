import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { buildPrediction } from '@/test/factories/prediction';
import { idlePredictionFeed } from '@/test/factories/hook-results';
import { usePredictionFeed } from '@/hooks/usePredictionFeed';
import { useDiscoveryFeedPage } from './useDiscoveryFeedPage';

vi.mock('@/hooks/usePredictionFeed', () => ({
  usePredictionFeed: vi.fn(),
}));

const mockUsePredictionFeed = vi.mocked(usePredictionFeed);

describe('useDiscoveryFeedPage', () => {
  beforeEach(() => {
    mockUsePredictionFeed.mockReset();
  });

  test('given a topic scope, should use one scoped prediction feed request', () => {
    mockUsePredictionFeed.mockReturnValue(idlePredictionFeed());

    renderHook(() =>
      useDiscoveryFeedPage({ topicSlug: 'finance' }),
    );

    expect(mockUsePredictionFeed).toHaveBeenCalledTimes(1);
    expect(mockUsePredictionFeed).toHaveBeenCalledWith(
      { topic: 'finance', status: 'all' },
      { pageSize: 80 },
    );
  });

  test('given outcome filter, should filter list client-side without a second fetch', async () => {
    mockUsePredictionFeed.mockReturnValue(idlePredictionFeed({
      data: [
        buildPrediction({
          id: '1',
          source: 'S',
          sourceSlug: 's',
          text: 'still open one',
          topicIds: ['topic-finance'],
        }),
        buildPrediction({
          id: '2',
          source: 'S',
          sourceSlug: 's',
          text: 'correct one',
          topicIds: ['topic-finance'],
          created_at: '2024-01-02T00:00:00.000Z',
          finished_at: '2024-01-03T00:00:00.000Z',
          outcome: 'correct',
        }),
      ],
    }));

    const { result } = renderHook(() =>
      useDiscoveryFeedPage({ topicSlug: 'finance' }),
    );

    act(() => {
      result.current.handleOutcomeFilter('correct');
    });

    await waitFor(() => {
      expect(result.current.listData).toHaveLength(1);
      expect(result.current.listData[0]!.outcome).toBe('correct');
    });

    expect(
      mockUsePredictionFeed.mock.calls.every(
        ([filters]) => filters.status === 'all',
      ),
    ).toBe(true);
    expect(result.current.scopeData).toHaveLength(2);
  });
});
