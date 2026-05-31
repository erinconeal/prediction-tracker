'use client';

import { memo } from 'react';
import type { FeedPlatformStats } from '@/lib/feed-platform-stats';
import {
  formatAccuracyPercent,
  formatTrackedCount,
} from '@/lib/feed-platform-stats';
type PlatformStatsWidgetProps = {
  stats: FeedPlatformStats;
  className?: string;
};

export const PlatformStatsWidget = memo(function PlatformStatsWidget({
  stats,
  className = '',
}: PlatformStatsWidgetProps) {
  return (
    <section
      className={`rounded-xl border border-interactive/20 bg-interactive/5 p-4 ${className}`.trim()}
      aria-label="Platform statistics"
    >
      <div className="flex divide-x divide-interactive/20 text-center">
        <div className="flex-1 px-4">
          <p className="text-interactive font-mono text-2xl font-semibold tabular-nums text-foreground">
            {formatTrackedCount(stats.trackedCount)}
          </p>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted">
            Tracked
          </p>
        </div>
        <div className="flex-1 px-4">
          <p className="text-interactive font-mono text-2xl font-semibold tabular-nums text-foreground">
            {formatAccuracyPercent(stats.averageAccuracyPercent)}
          </p>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-muted">
            Avg accuracy
          </p>
        </div>
      </div>
    </section>
  );
});
