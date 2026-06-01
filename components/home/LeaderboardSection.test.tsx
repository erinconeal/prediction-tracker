import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import {
  credibleLeaderboardRows,
  thinLeaderboardRows,
} from '@/test/factories/credible-leaderboard-rows';
import { idleLeaderboard } from '@/test/factories/hook-results';
import { LeaderboardSection } from './LeaderboardSection';
import * as useLeaderboardModule from '@/hooks/useLeaderboard';

vi.mock('@/hooks/useLeaderboard');

const useLeaderboard = vi.mocked(useLeaderboardModule.useLeaderboard);

describe('LeaderboardSection', () => {
  beforeEach(() => {
    useLeaderboard.mockReset();
  });

  test('renders insufficient-data UI when rankings are not credible', () => {
    useLeaderboard.mockReturnValue(
      idleLeaderboard({ rows: thinLeaderboardRows() }),
    );

    render(<LeaderboardSection limit={10} />);

    expect(
      screen.getByText(/rankings appear once we have at least/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/3 so far/i)).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /how we score/i }),
    ).toHaveAttribute('href', '/about');
    expect(
      screen.getByRole('link', { name: /jane analyst.*2 of 2 scored/i }),
    ).toHaveAttribute('href', '/source/jane-analyst');
    expect(screen.queryByText(/accuracy ledger/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/leading source/i)).not.toBeInTheDocument();
  });

  test('renders full leaderboard with leading source and ledger when credible', () => {
    useLeaderboard.mockReturnValue(
      idleLeaderboard({ rows: credibleLeaderboardRows() }),
    );

    render(<LeaderboardSection limit={10} />);

    expect(screen.getByText(/leading source/i)).toBeInTheDocument();
    expect(screen.getByText(/3 correct in a row/i)).toBeInTheDocument();
    expect(screen.getByText(/5 scored \(correct \+ incorrect\)/i))
      .toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /accuracy ledger/i }))
      .toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Leader One' }),
    ).toHaveAttribute('href', '/source/leader-one');
    expect(
      screen.getByLabelText(/source accuracy 80 percent, strong track record/i),
    ).toBeInTheDocument();
  });

  test('renders incorrect streak on credible leaderboard', () => {
    useLeaderboard.mockReturnValue(
      idleLeaderboard({
        rows: credibleLeaderboardRows().map((r, i) =>
          i === 1
            ? {
                ...r,
                streakKind: 'incorrect' as const,
                streakLength: 2,
              }
            : r,
        ),
      }),
    );

    render(<LeaderboardSection />);

    expect(screen.getByText(/2 incorrect in a row/i)).toBeInTheDocument();
  });

  test('merges ranks into single ledger when fewer than six rows', () => {
    useLeaderboard.mockReturnValue(
      idleLeaderboard({
        rows: credibleLeaderboardRows().slice(0, 4),
      }),
    );

    render(<LeaderboardSection />);

    expect(screen.getByText(/leading source/i)).toBeInTheDocument();
    expect(screen.queryByText(/accuracy ledger/i)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Runner Two' })).toBeInTheDocument();
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

  test('shows empty copy when no sources ranked', () => {
    useLeaderboard.mockReturnValue(idleLeaderboard({ rows: [] }));

    render(<LeaderboardSection />);

    expect(
      screen.getByText(/no sources ranked yet/i),
    ).toBeInTheDocument();
  });
});
