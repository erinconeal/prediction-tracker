'use client';

import { useEffect, useRef } from 'react';
import { useLeaderboardPage } from '@/hooks/useLeaderboardPage';
import { LeaderboardInsufficientPanel } from '@/components/home/leaderboard/LeaderboardInsufficientPanel';
import { LeaderboardFullTableLayout } from './LeaderboardFullTableLayout';
import { LeaderboardLoadingSkeleton } from './LeaderboardLoadingSkeleton';
import { LeaderboardPageHeader } from './LeaderboardPageHeader';

function formatShowingRange(from: number, to: number, total: number): string {
  if (total === 0) return 'No sources ranked yet';
  return `Showing ${from}–${to} of ${total} source${total === 1 ? '' : 's'}`;
}

export function LeaderboardPageView() {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const {
    rows,
    total,
    rankedCount,
    showFullRankings,
    displayStats,
    loading,
    loadingMore,
    error,
    hasMore,
    refetch,
    loadMore,
  } = useLeaderboardPage();

  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <div className="space-y-8">
      <LeaderboardPageHeader ref={headingRef} />

      {loading && rows.length === 0
        ? (
            <LeaderboardLoadingSkeleton variant="full" />
          )
        : null}

      {error
        ? (
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
            </div>
          )
        : null}

      {!loading && !error && rows.length === 0
        ? (
            <p className="text-sm text-muted">
              No sources ranked yet. Rankings appear once predictions are scored.
            </p>
          )
        : null}

      {!error && rows.length > 0 && !showFullRankings
        ? (
            <LeaderboardInsufficientPanel
              rows={rows}
              displayStats={displayStats ?? undefined}
            />
          )
        : null}

      {!error && rows.length > 0 && showFullRankings
        ? (
            <div className="space-y-4">
              <p className="text-sm text-muted" role="status">
                {formatShowingRange(1, rows.length, total)}
                {rankedCount > 0 && rankedCount !== total
                  ? ` · ${rankedCount} with scored predictions`
                  : ''}
              </p>
              <LeaderboardFullTableLayout rows={rows} />
              {hasMore
                ? (
                    <div className="flex justify-center pt-2">
                      <button
                        type="button"
                        className="rounded-full border border-border bg-surface-elevated px-6 py-2.5 text-sm font-medium text-foreground shadow-sm hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50"
                        disabled={loadingMore}
                        onClick={() => void loadMore()}
                      >
                        {loadingMore ? 'Loading…' : 'Load more'}
                      </button>
                    </div>
                  )
                : null}
            </div>
          )
        : null}
    </div>
  );
}
