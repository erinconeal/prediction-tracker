'use client';

import Link from 'next/link';
import { SourceAccuracyBadge } from '@/components/forecast/SourceAccuracyBadge';
import { LeaderboardAccuracyBar } from '@/components/home/leaderboard/LeaderboardAccuracyBar';
import { forecastDisplayMetricFromAccuracyPercent } from '@/lib/forecast-display-metric';
import { InfoPopover } from '@/components/ui/InfoPopover';
import { formatLeaderboardAccuracyContext } from '@/lib/leaderboard-row-context';
import {
  LIFECYCLE_GLOSSARY_ANCHOR,
  STAT_NO_LONGER_OPEN,
  STAT_NO_LONGER_OPEN_HINT,
} from '@/lib/lifecycle-copy';
import type { SourceAccuracyStats } from '@/lib/source-stats';

const statCard
  = 'rounded-xl border border-border bg-surface-elevated p-4 shadow-sm';

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
        </div>
      </aside>
    );
  }

  const metric = forecastDisplayMetricFromAccuracyPercent(stats.accuracy);
  const contextLine = formatLeaderboardAccuracyContext(stats);
  const accuracyLabel
    = stats.accuracy === null ? undefined : `Accuracy ${stats.accuracy}%`;

  return (
    <aside aria-label="Source statistics" className="space-y-4">
      <div className={statCard}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Accuracy
          </p>
          <SourceAccuracyBadge metric={metric} />
        </div>
        <p className="mt-2 font-mono text-3xl font-semibold tabular-nums text-foreground">
          {stats.accuracy === null ? '—' : `${stats.accuracy}%`}
        </p>
        <LeaderboardAccuracyBar
          percent={stats.accuracy}
          ariaLabel={accuracyLabel}
        />
        <p className="mt-3 text-xs text-muted">{contextLine}</p>
      </div>

      <div className={statCard}>
        <p className="text-xs font-medium uppercase tracking-wide text-muted">
          Total predictions
        </p>
        <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-foreground">
          {stats.total}
        </p>
      </div>

      <div className={statCard}>
        <div className="flex items-center justify-between gap-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            {STAT_NO_LONGER_OPEN}
          </p>
          <InfoPopover label={`About ${STAT_NO_LONGER_OPEN}`}>
            {STAT_NO_LONGER_OPEN_HINT}
          </InfoPopover>
        </div>
        <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-foreground">
          {stats.noLongerOpen}
        </p>
      </div>

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
