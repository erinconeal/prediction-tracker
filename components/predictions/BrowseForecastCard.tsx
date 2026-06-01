'use client';

import { memo } from 'react';
import { ForecastCardMetaFooter } from '@/components/forecast/ForecastCardMetaFooter';
import { ForecastCardShell } from '@/components/forecast/ForecastCardShell';
import { ForecastCardSourceHeader } from '@/components/forecast/ForecastCardSourceHeader';
import { ForecastCardTitle } from '@/components/forecast/ForecastCardTitle';
import { OutcomeBadge } from '@/components/predictions/OutcomeBadge';
import { OutcomeFilterButton } from '@/components/predictions/OutcomeFilterButton';
import { browseForecastTiming } from '@/lib/browse-forecast-timing';
import type { Outcome, Prediction } from '@/types/prediction';
import { truncateWithEllipsis } from '@/utils/truncate-text';

type BrowseForecastCardBaseProps = {
  prediction: Prediction;
  className?: string;
  hideSourceHeader?: boolean;
};

type BrowseForecastCardFilterProps = BrowseForecastCardBaseProps & {
  readOnlyOutcome?: false;
  onOutcomeFilter: (outcome: Outcome) => void;
};

type BrowseForecastCardReadOnlyProps = BrowseForecastCardBaseProps & {
  readOnlyOutcome: true;
  onOutcomeFilter?: never;
};

export type BrowseForecastCardProps
  = | BrowseForecastCardFilterProps
    | BrowseForecastCardReadOnlyProps;

export const BrowseForecastCard = memo(function BrowseForecastCard(
  props: BrowseForecastCardProps,
) {
  const {
    prediction: p,
    className = '',
    hideSourceHeader = false,
  } = props;

  const timing = browseForecastTiming(p);
  const titleText = truncateWithEllipsis(p.text, 160);
  const titleLink = (
    <ForecastCardTitle
      predictionId={p.id}
      text={titleText}
    />
  );

  const outcomeControl = props.readOnlyOutcome === true
    ? <OutcomeBadge outcome={p.outcome} />
    : (
        <OutcomeFilterButton
          outcome={p.outcome}
          onFilter={props.onOutcomeFilter}
        />
      );

  const header = hideSourceHeader
    ? null
    : (
        <ForecastCardSourceHeader
          sourceName={p.source}
          sourceSlug={p.sourceSlug}
          headerEnd={outcomeControl}
        />
      );

  const title = hideSourceHeader
    ? (
        <div className="flex items-start justify-between gap-3">
          <span className="min-w-0 flex-1">{titleLink}</span>
          {outcomeControl}
        </div>
      )
    : titleLink;

  return (
    <ForecastCardShell
      className={className}
      header={header}
      title={title}
      wrapTitleInHeading={hideSourceHeader === false}
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
