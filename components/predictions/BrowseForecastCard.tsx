'use client';

import { memo } from 'react';
import { ForecastCardMetaFooter } from '@/components/forecast/ForecastCardMetaFooter';
import { ForecastCardShell } from '@/components/forecast/ForecastCardShell';
import { ForecastCardSourceHeader } from '@/components/forecast/ForecastCardSourceHeader';
import { ForecastCardTitle } from '@/components/forecast/ForecastCardTitle';
import { OutcomeFilterButton } from '@/components/predictions/OutcomeFilterButton';
import { browseForecastTiming } from '@/lib/browse-forecast-timing';
import type { Outcome, Prediction } from '@/types/prediction';
import { truncateWithEllipsis } from '@/utils/truncate-text';

type BrowseForecastCardProps = {
  prediction: Prediction;
  onOutcomeFilter: (outcome: Outcome) => void;
  className?: string;
};

export const BrowseForecastCard = memo(function BrowseForecastCard({
  prediction: p,
  onOutcomeFilter,
  className = '',
}: BrowseForecastCardProps) {
  const timing = browseForecastTiming(p);

  return (
    <ForecastCardShell
      className={className}
      header={(
        <ForecastCardSourceHeader
          sourceName={p.source}
          sourceSlug={p.sourceSlug}
          headerEnd={(
            <OutcomeFilterButton
              outcome={p.outcome}
              onFilter={onOutcomeFilter}
            />
          )}
        />
      )}
      title={(
        <ForecastCardTitle
          predictionId={p.id}
          text={truncateWithEllipsis(p.text, 160)}
        />
      )}
      afterTitle={(
        <p className="text-xs text-muted">
          {timing.prefix}
          {' '}
          <time dateTime={timing.dateTime}>{timing.dateLabel}</time>
        </p>
      )}
      footer={(
        <ForecastCardMetaFooter topicIds={p.topicIds} />
      )}
    />
  );
});
