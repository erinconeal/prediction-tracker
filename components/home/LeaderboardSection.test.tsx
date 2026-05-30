import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { buildLeaderboardRow } from '@/test/factories/leaderboard-row';
import { idleLeaderboard } from '@/test/factories/hook-results';
import { LeaderboardSection } from './LeaderboardSection';
import * as useLeaderboardModule from '@/hooks/useLeaderboard';

vi.mock('@/hooks/useLeaderboard');

const useLeaderboard = vi.mocked(useLeaderboardModule.useLeaderboard);

describe('LeaderboardSection', () => {
  beforeEach(() => {
    useLeaderboard.mockReset();
  });

  test('renders featured leader with source slug link', async () => {
    useLeaderboard.mockReturnValue(
      idleLeaderboard({
        rows: [buildLeaderboardRow({
          source: 'Jane Analyst',
          sourceSlug: 'jane-analyst',
          total: 4,
          resolved: 3,
          scored: 3,
          correct: 3,
          accuracyPercent: 100,
          pending: 1,
          streakKind: 'correct',
          streakLength: 3,
        })],
      }),
    );

    render(<LeaderboardSection limit={10} />);

    expect(
      screen.getByRole('heading', { name: /top predictors/i }),
    ).toBeInTheDocument();
    const profile = screen.getByRole('link', { name: 'Jane Analyst' });
    expect(profile).toHaveAttribute('href', '/source/jane-analyst');
  });

  test('given error, retry calls refetch', async () => {
    const refetch = vi.fn().mockResolvedValue(undefined);
    useLeaderboard.mockReturnValue(
      idleLeaderboard({ rows: [], error: 'offline', refetch }),
    );

    render(<LeaderboardSection />);

    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(refetch).toHaveBeenCalled();
  });

  test('shows loading shell while fetching', () => {
    useLeaderboard.mockReturnValue(idleLeaderboard({ loading: true }));

    render(<LeaderboardSection />);

    expect(document.querySelector('.animate-pulse')).toBeTruthy();
  });
});
