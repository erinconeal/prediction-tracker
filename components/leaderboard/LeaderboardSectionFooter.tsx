'use client';

import Link from 'next/link';

export function LeaderboardSectionFooter({
  rankedCount,
}: {
  rankedCount: number | null;
}) {
  const detail
    = rankedCount !== null && rankedCount > 0
      ? ` (${rankedCount} ranked source${rankedCount === 1 ? '' : 's'})`
      : '';

  return (
    <div className="rounded-md border border-border bg-surface">
      <Link
        href="/leaderboard"
        className="flex min-h-[44px] items-center justify-center px-4 py-3 text-center text-sm font-semibold text-foreground transition-colors hover:bg-interactive/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        View full leaderboard
        {detail}
      </Link>
    </div>
  );
}
