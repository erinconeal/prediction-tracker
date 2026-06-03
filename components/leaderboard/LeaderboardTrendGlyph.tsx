'use client';

import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import {
  forecastDisplayMetricFromAccuracyPercent,
  type ForecastTrend,
} from '@/lib/forecast-display-metric';

const TREND_LABEL: Record<ForecastTrend, string> = {
  up: 'Strong track record',
  down: 'Weak track record',
  flat: 'Mixed track record',
};

const TREND_CLASS: Record<ForecastTrend, string> = {
  up: 'text-success',
  down: 'text-error',
  flat: 'text-muted',
};

export function LeaderboardTrendGlyph({
  accuracyPercent,
}: {
  accuracyPercent: number | null;
}) {
  const metric = forecastDisplayMetricFromAccuracyPercent(accuracyPercent);
  if (metric.percent === null) {
    return (
      <span className="font-mono text-sm text-muted" aria-hidden>
        —
      </span>
    );
  }

  const { trend } = metric;
  const label = TREND_LABEL[trend];

  return (
    <span
      className={`inline-flex items-center justify-center ${TREND_CLASS[trend]}`}
      aria-label={label}
      title={label}
    >
      {trend === 'up'
        ? (
            <TrendingUp className="size-4" aria-hidden />
          )
        : trend === 'down'
          ? (
              <TrendingDown className="size-4" aria-hidden />
            )
          : (
              <Minus className="size-4" aria-hidden />
            )}
    </span>
  );
}
