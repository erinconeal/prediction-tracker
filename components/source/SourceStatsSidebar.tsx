'use client';

import Link from 'next/link';
import { LeaderboardAccuracyBar } from '@/components/home/leaderboard/LeaderboardAccuracyBar';
import {
  sourceStatCardClass,
  SourceStatCountCard,
} from '@/components/source/SourceStatCountCard';
import { formatLeaderboardAccuracyContext } from '@/lib/leaderboard-row-context';
import {
  LIFECYCLE_GLOSSARY_ANCHOR,
  OUTCOME_STILL_OPEN_LABEL,
  STAT_NO_LONGER_OPEN,
  STAT_NO_LONGER_OPEN_HINT,
  STAT_STILL_OPEN_HINT,
} from '@/lib/lifecycle-copy';
import type { SourceAccuracyStats } from '@/lib/source-stats';

type SourceStatsSidebarProps = {
  stats: SourceAccuracyStats;
  loading?: boolean;
};

export function SourceStatsSidebar({ stats, loading = false }: SourceStatsSidebarProps) {
  if (loading) {
    return (
      <aside aria-label="Source statistics" aria-busy="true">
        <div className="space-y-4">
          <div className="h-32 animate-pulse rounded-xl bg-surface" />
          <div className="h-20 animate-pulse rounded-xl bg-surface" />
          <div className="h-20 animate-pulse rounded-xl bg-surface" />
          <div className="h-20 animate-pulse rounded-xl bg-surface" />
        </div>
      </aside>
    );
  }

  const contextLine = formatLeaderboardAccuracyContext(stats);
  const accuracyLabel
    = stats.accuracy === null ? undefined : `Accuracy ${stats.accuracy}%`;

  return (
    <aside aria-label="Source statistics" className="space-y-4">
      <div className={sourceStatCardClass}>
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          Accuracy
        </p>
        <p className="mt-2 font-mono text-3xl font-semibold tabular-nums text-foreground">
          {stats.accuracy === null ? '—' : `${stats.accuracy}%`}
        </p>
        <LeaderboardAccuracyBar
          percent={stats.accuracy}
          ariaLabel={accuracyLabel}
        />
        <p className="mt-3 text-xs text-muted">{contextLine}</p>
      </div>

      <SourceStatCountCard label="Total predictions" value={stats.total} />

      <SourceStatCountCard
        label={OUTCOME_STILL_OPEN_LABEL}
        value={stats.stillOpen}
        about={{
          popoverLabel: `About ${OUTCOME_STILL_OPEN_LABEL}`,
          hint: STAT_STILL_OPEN_HINT,
        }}
      />

      <SourceStatCountCard
        label={STAT_NO_LONGER_OPEN}
        value={stats.noLongerOpen}
        about={{
          popoverLabel: `About ${STAT_NO_LONGER_OPEN}`,
          hint: STAT_NO_LONGER_OPEN_HINT,
        }}
      />

      <p className="text-sm text-muted">
        <Link
          href={`/about#${LIFECYCLE_GLOSSARY_ANCHOR}`}
          className="font-medium text-interactive underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          How we score
        </Link>
      </p>
    </aside>
  );
}
