'use client';

import { memo, useMemo } from 'react';
import { ForecastCardMetaFooter } from '@/components/forecast/ForecastCardMetaFooter';
import { ForecastCardShell } from '@/components/forecast/ForecastCardShell';
import { ForecastCardSourceHeader } from '@/components/forecast/ForecastCardSourceHeader';
import { ForecastCardTitle } from '@/components/forecast/ForecastCardTitle';
import {
  forecastDisplayMetricFromStats,
  trendAriaLabel,
} from '@/lib/forecast-display-metric';
import { computeSourceAccuracyStats } from '@/lib/source-stats';
import type { Prediction } from '@/types/prediction';

type PopularForecastCardProps = {
  prediction: Prediction;
  statsContext: Prediction[];
  className?: string;
};

const BADGE_CLASS = {
  up: 'bg-success/12 text-success',
  down: 'bg-error/12 text-error',
  flat: 'bg-warning/15 text-warning',
} as const;

export const PopularForecastCard = memo(function PopularForecastCard({
  prediction,
  statsContext,
  className = '',
}: PopularForecastCardProps) {
  const stats = useMemo(
    () =>
      computeSourceAccuracyStats(
        statsContext.filter(p => p.sourceSlug === prediction.sourceSlug),
        {
          nameFallback: prediction.sourceSlug,
          primaryName: prediction.source,
        },
      ),
    [statsContext, prediction.sourceSlug, prediction.source],
  );

  const metric = forecastDisplayMetricFromStats(stats);
  const badgeClass = BADGE_CLASS[metric.trend];
  const badgeText
    = metric.percent === null
      ? '— accurate'
      : `${metric.percent}% accurate`;

  const metricAria
    = metric.percent === null
      ? `Source accuracy unavailable, ${trendAriaLabel(metric.trend)}`
      : `Source accuracy ${metric.percent} percent, ${trendAriaLabel(metric.trend)}`;

  const sourceAccuracyCorner = (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 font-mono text-xs font-semibold tabular-nums ${badgeClass}`}
      aria-label={metricAria}
    >
      <span aria-hidden>{badgeText}</span>
    </span>
  );

  return (
    <ForecastCardShell
      className={className}
      header={(
        <ForecastCardSourceHeader
          sourceName={prediction.source}
          sourceSlug={prediction.sourceSlug}
          headerEnd={sourceAccuracyCorner}
        />
      )}
      title={(
        <ForecastCardTitle
          predictionId={prediction.id}
          text={prediction.text}
        />
      )}
      footer={(
        <ForecastCardMetaFooter topicIds={prediction.topicIds} />
      )}
    />
  );
});
