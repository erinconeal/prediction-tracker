'use client';

import { Trophy } from 'lucide-react';
import Link from 'next/link';
import { SourceAccuracyBadge } from '@/components/forecast/SourceAccuracyBadge';
import { SourceAvatar } from '@/components/ui/SourceAvatar';
import { forecastDisplayMetricFromAccuracyPercent } from '@/lib/forecast-display-metric';
import type { LeaderboardRow } from '@/lib/leaderboard';
import { formatLeaderboardAccuracyContext } from '@/lib/leaderboard-row-context';
import { LeaderboardStreakBadge } from '@/components/home/leaderboard/LeaderboardStreakBadge';

export function LeaderboardFeaturedSource({ row }: { row: LeaderboardRow }) {
  const metric = forecastDisplayMetricFromAccuracyPercent(row.accuracyPercent);
  const contextLine = formatLeaderboardAccuracyContext(row);
  const fraction
    = row.scored > 0 ? `${row.correct}/${row.scored} scored` : null;

  return (
    <article className="rounded-xl border border-border bg-surface-elevated p-5 shadow-sm">
      <p className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
        <Trophy className="size-3.5" aria-hidden />
        Leading source
      </p>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
        <SourceAvatar name={row.source} size="lg" />
        <div className="min-w-0 flex-1">
          <SourceAccuracyBadge metric={metric} />
          <h3 className="mt-2 font-serif text-xl font-normal tracking-tight text-foreground sm:text-2xl">
            <Link
              href={`/source/${encodeURIComponent(row.sourceSlug)}`}
              className="hover:text-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {row.source}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-muted">{contextLine}</p>
          {fraction
            ? (
                <p className="mt-1 font-mono text-sm tabular-nums text-ink">
                  {fraction}
                </p>
              )
            : null}
          <LeaderboardStreakBadge row={row} />
        </div>
      </div>
    </article>
  );
}
