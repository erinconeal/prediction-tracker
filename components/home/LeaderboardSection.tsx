'use client';

import { memo, type ReactNode } from 'react';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { shouldShowFullLeaderboard } from '@/lib/leaderboard-display';
import { FullLeaderboard } from './leaderboard/LeaderboardLedger';
import { LeaderboardInsufficientPanel } from './leaderboard/LeaderboardInsufficientPanel';
import { LeaderboardSectionHeader } from './leaderboard/LeaderboardSectionHeader';

type LeaderboardSectionProps = {
  limit?: number;
  className?: string;
};

export const LeaderboardSection = memo(function LeaderboardSection({
  limit = 10,
  className = '',
}: LeaderboardSectionProps) {
  const { rows, loading, error, refetch } = useLeaderboard(limit);

  const shell = (body: ReactNode) => (
    <section
      className={`space-y-6 ${className}`.trim()}
      aria-labelledby="leaderboard-heading"
    >
      <LeaderboardSectionHeader />
      {body}
    </section>
  );

  if (loading && rows.length === 0) {
    return shell(
      <div
        className="h-48 animate-pulse rounded-md bg-surface"
        aria-hidden
      />,
    );
  }

  if (error) {
    return shell(
      <div
        className="rounded-md border border-error/35 bg-error/10 px-4 py-3 text-sm text-error"
        role="alert"
      >
        <p>{error}</p>
        <button
          type="button"
          className="mt-3 rounded-lg bg-error px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive"
          onClick={() => void refetch()}
        >
          Retry
        </button>
      </div>,
    );
  }

  if (rows.length === 0) {
    return shell(
      <p className="text-sm text-muted">
        No sources ranked yet. Rankings appear once predictions are scored.
      </p>,
    );
  }

  if (!shouldShowFullLeaderboard(rows)) {
    return shell(<LeaderboardInsufficientPanel rows={rows} />);
  }

  return shell(<FullLeaderboard rows={rows} />);
});
