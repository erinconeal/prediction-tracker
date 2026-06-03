import '@/test/mocks/api-service';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test } from 'vitest';
import { buildLeaderboardPage } from '@/test/factories/leaderboard-page';
import { buildLeaderboardRow } from '@/test/factories/leaderboard-row';
import { listLeaderboard } from '@/test/mocks/api-service';
import { useLeaderboardPage } from './useLeaderboardPage';

describe('useLeaderboardPage', () => {
  beforeEach(() => {
    listLeaderboard.mockReset();
  });

  test('given first page load, should expose server gating metadata', async () => {
    listLeaderboard.mockResolvedValue(
      buildLeaderboardPage({
        rows: [buildLeaderboardRow({ source: 'Leader', sourceSlug: 'leader' })],
        total: 3,
        rankedCount: 3,
        showFullRankings: true,
        displayStats: {
          distinctSourcesWithScored: 3,
          totalScored: 10,
          topSourceScored: 3,
        },
      }),
    );

    const { result } = renderHook(() => useLeaderboardPage());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(listLeaderboard).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 50, offset: 0 }),
    );
    expect(result.current.showFullRankings).toBe(true);
    expect(result.current.displayStats?.totalScored).toBe(10);
    expect(result.current.rows).toHaveLength(1);
  });

  test('given hasMore, loadMore should append the next page', async () => {
    listLeaderboard
      .mockResolvedValueOnce(
        buildLeaderboardPage({
          rows: [buildLeaderboardRow({ source: 'A', sourceSlug: 'a', rank: 1 })],
          total: 2,
          hasMore: true,
          showFullRankings: true,
        }),
      )
      .mockResolvedValueOnce(
        buildLeaderboardPage({
          rows: [buildLeaderboardRow({ source: 'B', sourceSlug: 'b', rank: 2 })],
          offset: 1,
          total: 2,
          hasMore: false,
          showFullRankings: true,
        }),
      );

    const { result } = renderHook(() => useLeaderboardPage());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.loadMore();
    });

    expect(listLeaderboard).toHaveBeenLastCalledWith(
      expect.objectContaining({ limit: 50, offset: 1 }),
    );
    expect(result.current.rows.map(r => r.sourceSlug)).toEqual(['a', 'b']);
  });

  test('given fetch failure, refetch should retry first page', async () => {
    listLeaderboard
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce(
        buildLeaderboardPage({
          rows: [buildLeaderboardRow({ source: 'Recovered', sourceSlug: 'recovered' })],
          showFullRankings: false,
        }),
      );

    const { result } = renderHook(() => useLeaderboardPage());
    await waitFor(() => expect(result.current.error).toBe('Something went wrong'));

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.rows[0]?.source).toBe('Recovered');
  });
});
