'use client';

import Link from 'next/link';
import { SourceAccuracyBadge } from '@/components/forecast/SourceAccuracyBadge';
import { SourceAvatar } from '@/components/ui/SourceAvatar';
import { forecastDisplayMetricFromAccuracyPercent } from '@/lib/forecast-display-metric';
import type { LeaderboardRow } from '@/lib/leaderboard';
import { LeaderboardRankBadge } from '@/components/home/leaderboard/LeaderboardRankBadge';

export function LeaderboardRunnerUpCard({ row }: { row: LeaderboardRow }) {
  const borderAccent = 'border-interactive/30 hover:bg-interactive/5';
  const metric = forecastDisplayMetricFromAccuracyPercent(row.accuracyPercent);
  const fraction
    = row.scored > 0 ? `${row.correct}/${row.scored}` : '—';

  return (
    <Link
      href={`/source/${encodeURIComponent(row.sourceSlug)}`}
      className={`flex min-h-[44px] items-center gap-3 rounded-md border bg-surface px-4 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background ${borderAccent}`}
    >
      <SourceAvatar name={row.source} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-medium text-foreground">{row.source}</p>
          <LeaderboardRankBadge rank={row.rank} />
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <SourceAccuracyBadge metric={metric} />
          <span className="font-mono text-xs tabular-nums text-muted">
            {fraction}
          </span>
        </div>
      </div>
    </Link>
  );
}
