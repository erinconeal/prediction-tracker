'use client';

import { memo, useMemo } from 'react';
import { ForecastCardMetaFooter } from '@/components/forecast/ForecastCardMetaFooter';
import { ForecastCardShell } from '@/components/forecast/ForecastCardShell';
import { ForecastCardSourceHeader } from '@/components/forecast/ForecastCardSourceHeader';
import { SourceAccuracyBadge } from '@/components/forecast/SourceAccuracyBadge';
import { ForecastCardTitle } from '@/components/forecast/ForecastCardTitle';
import { forecastDisplayMetricFromStats } from '@/lib/forecast-display-metric';
import { computeSourceAccuracyStats } from '@/lib/source-stats';
import type { Prediction } from '@/types/prediction';

type PopularForecastCardProps = {
  prediction: Prediction;
  statsContext: Prediction[];
  className?: string;
};

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

  return (
    <ForecastCardShell
      className={className}
      header={(
        <ForecastCardSourceHeader
          sourceName={prediction.source}
          sourceSlug={prediction.sourceSlug}
          headerEnd={<SourceAccuracyBadge metric={metric} />}
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
