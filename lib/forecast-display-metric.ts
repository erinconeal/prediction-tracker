import type { SourceAccuracyStats } from '@/lib/source-stats';

export type ForecastTrend = 'up' | 'down' | 'flat';

export type ForecastDisplayMetric = {
  /** Rounded whole percent for badge; null when no scored predictions. */
  percent: number | null;
  trend: ForecastTrend;
};

/**
 * Maps source accuracy into hero badge + sparkline tone. Not market odds —
 * encodes track-record strength for the consensus source.
 */
export function forecastDisplayMetricFromStats(
  stats: SourceAccuracyStats,
): ForecastDisplayMetric {
  const percent
    = stats.accuracy === null ? null : Math.round(stats.accuracy);

  if (percent === null) {
    return { percent: null, trend: 'flat' };
  }
  if (percent >= 60) return { percent, trend: 'up' };
  if (percent < 40) return { percent, trend: 'down' };
  return { percent, trend: 'flat' };
}

export function trendAriaLabel(trend: ForecastTrend): string {
  switch (trend) {
    case 'up':
      return 'trending up';
    case 'down':
      return 'trending down';
    default:
      return 'steady';
  }
}
