'use client';

import { memo, type ReactNode } from 'react';
import { LeaderboardPreviewLayout } from '@/components/leaderboard/LeaderboardPreviewLayout';
import { LeaderboardSectionFooter } from '@/components/leaderboard/LeaderboardSectionFooter';
import { LeaderboardLoadingSkeleton } from '@/components/leaderboard/LeaderboardLoadingSkeleton';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { LeaderboardInsufficientPanel } from './leaderboard/LeaderboardInsufficientPanel';
import { LeaderboardSectionHeader, LEADERBOARD_HEADING_ID } from './leaderboard/LeaderboardSectionHeader';

type LeaderboardSectionProps = {
  limit?: number;
  className?: string;
};

export const LeaderboardSection = memo(function LeaderboardSection({
  limit = 10,
  className = '',
}: LeaderboardSectionProps) {
  const { rows, rankedCount, showFullRankings, displayStats, loading, error, refetch }
    = useLeaderboard(limit);

  const shell = (body: ReactNode, showFooter = false) => (
    <section
      className={`space-y-6 ${className}`.trim()}
      aria-labelledby={LEADERBOARD_HEADING_ID}
    >
      <LeaderboardSectionHeader />
      {body}
      {showFooter ? <LeaderboardSectionFooter rankedCount={rankedCount} /> : null}
    </section>
  );

  if (loading && rows.length === 0) {
    return shell(<LeaderboardLoadingSkeleton variant="preview" />);
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

  if (!showFullRankings) {
    return shell(
      <LeaderboardInsufficientPanel rows={rows} displayStats={displayStats ?? undefined} />,
    );
  }

  return shell(<LeaderboardPreviewLayout rows={rows} />, true);
});
