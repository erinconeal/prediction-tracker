'use client';

import { memo } from 'react';
import { ForecastCardMetaFooter } from '@/components/forecast/ForecastCardMetaFooter';
import { ForecastCardShell } from '@/components/forecast/ForecastCardShell';
import { ForecastCardSourceHeader } from '@/components/forecast/ForecastCardSourceHeader';
import { ForecastCardTitle } from '@/components/forecast/ForecastCardTitle';
import { OutcomeFilterButton } from '@/components/predictions/OutcomeFilterButton';
import { formatIsoDate, formatMonthYear } from '@/utils/format-date';
import type { Outcome, Prediction } from '@/types/prediction';
import { truncateWithEllipsis } from '@/utils/truncate-text';

type BrowseForecastCardProps = {
  prediction: Prediction;
  outcomeFilter: Outcome | 'all';
  onOutcomeFilter: (outcome: Outcome) => void;
  className?: string;
};

export const BrowseForecastCard = memo(function BrowseForecastCard({
  prediction: p,
  outcomeFilter,
  onOutcomeFilter,
  className = '',
}: BrowseForecastCardProps) {
  const timingLine = p.target_date
    ? `Target ${formatMonthYear(p.target_date)}`
    : `Added ${formatIsoDate(p.created_at)}`;

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
              pressed={outcomeFilter === p.outcome}
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
        <p className="text-xs text-muted">{timingLine}</p>
      )}
      footer={(
        <ForecastCardMetaFooter
          category={p.category}
          topicIds={p.topicIds}
        />
      )}
    />
  );
});
