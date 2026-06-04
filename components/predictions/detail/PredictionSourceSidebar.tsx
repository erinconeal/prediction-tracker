'use client';

import Link from 'next/link';
import { SourceAccuracyBadge } from '@/components/forecast/SourceAccuracyBadge';
import { SourceStatsSidebar } from '@/components/source/SourceStatsSidebar';
import { SourceAvatar } from '@/components/ui/SourceAvatar';
import { forecastDisplayMetricFromAccuracyPercent } from '@/lib/forecast-display-metric';
import type { SourceAccuracyStats } from '@/lib/source-stats';

const profileCardClass
  = 'rounded-xl border border-border bg-surface-elevated p-5 shadow-sm';

type PredictionSourceSidebarProps = {
  sourceName: string;
  sourceSlug: string;
  stats: SourceAccuracyStats;
  loading?: boolean;
  snapshotCapped?: boolean;
};

export function PredictionSourceSidebar({
  sourceName,
  sourceSlug,
  stats,
  loading = false,
  snapshotCapped = false,
}: PredictionSourceSidebarProps) {
  const displayName = stats.name || sourceName;
  const metric = forecastDisplayMetricFromAccuracyPercent(stats.accuracy);

  if (loading) {
    return (
      <div className="space-y-4" aria-busy="true" aria-label="Source profile">
        <div className="h-36 animate-pulse rounded-xl bg-surface" />
        <div className="h-32 animate-pulse rounded-xl bg-surface" />
        <div className="h-20 animate-pulse rounded-xl bg-surface" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className={profileCardClass}>
        <div className="flex items-start gap-4">
          <SourceAvatar name={displayName} size="lg" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
              <Link
                href={`/source/${encodeURIComponent(sourceSlug)}`}
                className="font-serif text-xl font-normal tracking-tight text-foreground underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {displayName}
              </Link>
              <SourceAccuracyBadge metric={metric} />
            </div>
            <p className="text-xs text-muted">
              Track record from scored forecasts — not live market odds.
            </p>
          </div>
        </div>
        <Link
          href={`/source/${encodeURIComponent(sourceSlug)}`}
          className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Full source profile
        </Link>
      </div>

      <SourceStatsSidebar
        stats={stats}
        snapshotCapped={snapshotCapped}
      />
    </div>
  );
}
