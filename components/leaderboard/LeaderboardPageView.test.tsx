import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { credibleLeaderboardRows } from '@/test/factories/credible-leaderboard-rows';
import { buildLeaderboardRow } from '@/test/factories/leaderboard-row';
import { LeaderboardPageView } from './LeaderboardPageView';
import * as useLeaderboardPageModule from '@/hooks/useLeaderboardPage';

vi.mock('@/hooks/useLeaderboardPage');

const useLeaderboardPage = vi.mocked(useLeaderboardPageModule.useLeaderboardPage);

function idlePageState(
  overrides: Partial<ReturnType<typeof useLeaderboardPage>> = {},
): ReturnType<typeof useLeaderboardPage> {
  return {
    rows: [],
    total: 0,
    rankedCount: 0,
    showFullRankings: false,
    displayStats: null,
    loading: false,
    loadingMore: false,
    error: null,
    hasMore: false,
    refetch: vi.fn().mockResolvedValue(undefined),
    loadMore: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

describe('LeaderboardPageView', () => {
  beforeEach(() => {
    useLeaderboardPage.mockReset();
  });

  test('given showFullRankings false, should render insufficient panel with server stats', () => {
    useLeaderboardPage.mockReturnValue(
      idlePageState({
        rows: [buildLeaderboardRow({ scored: 2, correct: 2 })],
        displayStats: {
          distinctSourcesWithScored: 2,
          totalScored: 4,
          topSourceScored: 2,
        },
      }),
    );

    render(<LeaderboardPageView />);

    expect(screen.getByText(/4 so far/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /load more/i })).not.toBeInTheDocument();
  });

  test('given showFullRankings true and hasMore, should load more on click', () => {
    const loadMore = vi.fn().mockResolvedValue(undefined);
    useLeaderboardPage.mockReturnValue(
      idlePageState({
        rows: credibleLeaderboardRows(),
        total: 12,
        rankedCount: 6,
        showFullRankings: true,
        hasMore: true,
        loadMore,
      }),
    );

    render(<LeaderboardPageView />);

    fireEvent.click(screen.getByRole('button', { name: /load more/i }));
    expect(loadMore).toHaveBeenCalled();
  });

  test('given error, retry should call refetch', () => {
    const refetch = vi.fn().mockResolvedValue(undefined);
    useLeaderboardPage.mockReturnValue(
      idlePageState({ error: 'offline', refetch }),
    );

    render(<LeaderboardPageView />);

    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(refetch).toHaveBeenCalled();
  });

  test('should move focus to page heading on mount', () => {
    useLeaderboardPage.mockReturnValue(idlePageState());

    render(<LeaderboardPageView />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Leaderboard' }),
    ).toHaveFocus();
  });
});
