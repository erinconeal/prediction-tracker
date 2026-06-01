import type { SourceAccuracyStats } from '@/lib/source-stats';

export type ForecastTrend = 'up' | 'down' | 'flat';

export type ForecastDisplayMetric = {
  /** Rounded whole percent for badge; null when no scored predictions. */
  percent: number | null;
  trend: ForecastTrend;
};

/**
 * Maps source accuracy into Popular badge tone. Not market odds —
 * encodes track-record strength for the consensus source.
 */
export function forecastDisplayMetricFromAccuracyPercent(
  accuracyPercent: number | null,
): ForecastDisplayMetric {
  const percent
    = accuracyPercent === null ? null : Math.round(accuracyPercent);

  if (percent === null) {
    return { percent: null, trend: 'flat' };
  }
  if (percent >= 60) return { percent, trend: 'up' };
  if (percent < 40) return { percent, trend: 'down' };
  return { percent, trend: 'flat' };
}

export function forecastDisplayMetricFromStats(
  stats: SourceAccuracyStats,
): ForecastDisplayMetric {
  return forecastDisplayMetricFromAccuracyPercent(stats.accuracy);
}

export type SourceAccuracyBadgeTone = ForecastTrend | 'unknown';

export function sourceAccuracyBadgeTone(
  metric: ForecastDisplayMetric,
): SourceAccuracyBadgeTone {
  if (metric.percent === null) return 'unknown';
  return metric.trend;
}

const TREND_GLYPH: Record<ForecastTrend, string> = {
  up: '↑',
  down: '↓',
  flat: '—',
};

export function sourceAccuracyBadgeVisibleText(
  metric: ForecastDisplayMetric,
): string {
  if (metric.percent === null) return '—';
  return `${metric.percent}% ${TREND_GLYPH[metric.trend]}`;
}

export function sourceAccuracyBadgeAriaLabel(
  metric: ForecastDisplayMetric,
): string {
  if (metric.percent === null) {
    return 'Source accuracy unavailable for this source';
  }

  switch (metric.trend) {
    case 'up':
      return `Source accuracy ${metric.percent} percent, strong track record`;
    case 'down':
      return `Source accuracy ${metric.percent} percent, weak track record`;
    default:
      return `Source accuracy ${metric.percent} percent, mixed track record`;
  }
}
