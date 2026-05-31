'use client';

import { memo } from 'react';
import {
  sourceAccuracyBadgeAriaLabel,
  sourceAccuracyBadgeTone,
  sourceAccuracyBadgeVisibleText,
  type ForecastDisplayMetric,
} from '@/lib/forecast-display-metric';

type SourceAccuracyBadgeProps = {
  metric: ForecastDisplayMetric;
  className?: string;
};

const BADGE_CLASS = {
  up: 'bg-success/12 text-success',
  down: 'bg-error/12 text-error',
  flat: 'bg-warning/15 text-warning',
  unknown: 'border border-border bg-surface text-muted',
} as const;

export const SourceAccuracyBadge = memo(function SourceAccuracyBadge({
  metric,
  className = '',
}: SourceAccuracyBadgeProps) {
  const tone = sourceAccuracyBadgeTone(metric);
  const visibleText = sourceAccuracyBadgeVisibleText(metric);

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-0.5 rounded-full px-2.5 py-1 font-mono text-xs font-semibold tabular-nums ${BADGE_CLASS[tone]} ${className}`.trim()}
      aria-label={sourceAccuracyBadgeAriaLabel(metric)}
      title={sourceAccuracyBadgeAriaLabel(metric)}
    >
      <span aria-hidden>{visibleText}</span>
    </span>
  );
});
