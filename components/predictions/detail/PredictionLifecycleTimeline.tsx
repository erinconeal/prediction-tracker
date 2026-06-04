'use client';

import { TIMELINE_FINISHED_LABEL } from '@/lib/lifecycle-copy';
import type { Outcome } from '@/types/prediction';
import { formatIsoDate, formatMonthYear } from '@/utils/format-date';

type PredictionLifecycleTimelineProps = {
  createdAt: string;
  targetDate: string | null;
  finishedAt: string | null;
  outcome: Outcome;
};

/** Anchor at border center (ps-6 + half of border-s-2), then center the dot on that point. */
const timelineDotClass
  = 'absolute top-1.5 start-[calc(-1.5rem-1px)] size-2.5 -translate-x-1/2 rounded-full ring-4 ring-background';

function outcomeDescription(outcome: Outcome): string {
  switch (outcome) {
    case 'still_open':
      return 'Still open — outcome not yet recorded.';
    case 'correct':
      return 'Recorded as correct against the evaluation criteria you apply for this tracker.';
    case 'incorrect':
      return 'Recorded as incorrect against the evaluation criteria you apply for this tracker.';
    case 'unresolved':
      return 'Outcome could not be determined with confidence (see constitution, section 6.3).';
    case 'invalid':
      return 'Excluded from scoring: failed inclusion or resolution criteria (see constitution, sections 6.3 and 7.3).';
  }
}

export function PredictionLifecycleTimeline({
  createdAt,
  targetDate,
  finishedAt,
  outcome,
}: PredictionLifecycleTimelineProps) {
  return (
    <section className="space-y-4" aria-labelledby="prediction-lifecycle-heading">
      <h2
        id="prediction-lifecycle-heading"
        className="text-base font-semibold text-foreground"
      >
        Timeline
      </h2>
      <ol className="m-0 list-none space-y-0 border-s-2 border-border ps-6">
        <li className="relative pb-6">
          <span
            className={`${timelineDotClass} bg-primary`}
            aria-hidden
          />
          <p className="text-sm font-medium text-foreground">Added</p>
          <p className="text-sm text-muted">{formatIsoDate(createdAt)}</p>
        </li>
        {targetDate
          ? (
              <li className="relative pb-6">
                <span
                  className={`${timelineDotClass} bg-border`}
                  aria-hidden
                />
                <p className="text-sm font-medium text-foreground">Target</p>
                <p className="text-sm text-muted">
                  {formatMonthYear(targetDate)}
                </p>
              </li>
            )
          : null}
        {finishedAt
          ? (
              <li className="relative pb-6">
                <span
                  className={`${timelineDotClass} bg-border`}
                  aria-hidden
                />
                <p className="text-sm font-medium text-foreground">
                  {TIMELINE_FINISHED_LABEL}
                </p>
                <p className="text-sm text-muted">
                  <time dateTime={finishedAt}>
                    {formatIsoDate(finishedAt)}
                  </time>
                </p>
              </li>
            )
          : null}
        <li className="relative">
          <span
            className={`${timelineDotClass} bg-border`}
            aria-hidden
          />
          <p className="text-sm font-medium text-foreground">Outcome</p>
          <p className="text-sm text-muted">{outcomeDescription(outcome)}</p>
        </li>
      </ol>
    </section>
  );
}
