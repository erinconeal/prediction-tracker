'use client';

import {
  forecastDisplayMetricFromAccuracyPercent,
  type ForecastDisplayMetric,
} from '@/lib/forecast-display-metric';

type AccuracyTone = ForecastDisplayMetric['trend'] | 'unknown';

function accuracyTone(percent: number | null): AccuracyTone {
  const metric = forecastDisplayMetricFromAccuracyPercent(percent);
  if (metric.percent === null) return 'unknown';
  return metric.trend;
}

const ACCURACY_BAR_CLASS: Record<AccuracyTone, string> = {
  up: 'bg-success',
  down: 'bg-error',
  flat: 'bg-warning',
  unknown: 'bg-muted',
};

export function LeaderboardAccuracyBar({
  percent,
  ariaLabel,
  compact = false,
}: {
  percent: number | null;
  ariaLabel?: string;
  compact?: boolean;
}) {
  const width = percent === null ? 0 : Math.min(100, Math.max(0, percent));
  const tone = accuracyTone(percent);
  return (
    <div
      className={
        compact
          ? 'mt-1 flex items-center gap-2'
          : 'mt-2 flex items-center gap-3'
      }
    >
      <div
        className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-surface"
        {...(percent !== null && ariaLabel
          ? {
              'role': 'progressbar' as const,
              'aria-valuenow': Math.round(percent),
              'aria-valuemin': 0,
              'aria-valuemax': 100,
              'aria-label': ariaLabel,
            }
          : { 'aria-hidden': true as const })}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${ACCURACY_BAR_CLASS[tone]}`}
          style={{ width: `${width}%` }}
        />
      </div>
      <span
        className={
          compact
            ? 'w-10 shrink-0 text-right font-mono text-xs tabular-nums text-foreground'
            : 'w-12 shrink-0 text-right font-mono text-sm tabular-nums text-foreground'
        }
      >
        {percent === null ? '—' : `${percent}%`}
      </span>
    </div>
  );
}
