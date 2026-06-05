'use client';

import { OutcomeBadge } from '@/components/predictions/OutcomeBadge';
import {
  buildTimelineSteps,
  isActiveTimelineStep,
  TIMELINE_STEP_LABELS,
  type TimelineStepId,
} from '@/lib/prediction-lifecycle-timeline';
import type { Outcome } from '@/types/prediction';
import { formatIsoDate, formatMonthYear } from '@/utils/format-date';
import type { ReactNode } from 'react';

type PredictionLifecycleTimelineProps = {
  createdAt: string;
  targetDate: string | null;
  finishedAt: string | null;
  outcome: Outcome;
};

type TimelineStepContext = {
  createdAt: string;
  targetDate: string | null;
  finishedAt: string | null;
  outcome: Outcome;
};

/** Anchor at border center (ps-6 + half of border-s-2), then center the dot on that point. */
const timelineDotClass
  = 'absolute top-1.5 start-[calc(-1.5rem-1px)] size-2.5 -translate-x-1/2 rounded-full ring-4 ring-background';

/** Returns timeline dot classes; active steps use the primary accent. */
function dotClassFor(isActive: boolean): string {
  return `${timelineDotClass} ${isActive ? 'bg-primary' : 'bg-border'}`;
}

function renderAddedStep({ createdAt }: TimelineStepContext): ReactNode {
  return (
    <>
      <p className="text-sm font-medium text-foreground">
        {TIMELINE_STEP_LABELS.added}
      </p>
      <p className="text-sm text-muted">{formatIsoDate(createdAt)}</p>
    </>
  );
}

function renderTargetStep({ targetDate }: TimelineStepContext): ReactNode | null {
  if (!targetDate) {
    return null;
  }

  return (
    <>
      <p className="text-sm font-medium text-foreground">
        {TIMELINE_STEP_LABELS.target}
      </p>
      <p className="text-sm text-muted">{formatMonthYear(targetDate)}</p>
    </>
  );
}

function renderFinishedStep({ finishedAt }: TimelineStepContext): ReactNode | null {
  if (!finishedAt) {
    return null;
  }

  return (
    <>
      <p className="text-sm font-medium text-foreground">
        {TIMELINE_STEP_LABELS.finished}
      </p>
      <p className="text-sm text-muted">
        <time dateTime={finishedAt}>{formatIsoDate(finishedAt)}</time>
      </p>
    </>
  );
}

function renderOutcomeStep({ outcome }: TimelineStepContext): ReactNode {
  return (
    <>
      <p className="text-sm font-medium text-foreground">
        {TIMELINE_STEP_LABELS.outcome}
      </p>
      <OutcomeBadge outcome={outcome} className="mt-1" />
    </>
  );
}

const TIMELINE_STEP_RENDERERS: Record<
  TimelineStepId,
  (context: TimelineStepContext) => ReactNode | null
> = {
  added: renderAddedStep,
  target: renderTargetStep,
  finished: renderFinishedStep,
  outcome: renderOutcomeStep,
};

export function PredictionLifecycleTimeline({
  createdAt,
  targetDate,
  finishedAt,
  outcome,
}: PredictionLifecycleTimelineProps) {
  const steps = buildTimelineSteps(outcome, targetDate, finishedAt);
  const stepContext: TimelineStepContext = {
    createdAt,
    targetDate,
    finishedAt,
    outcome,
  };

  return (
    <section className="space-y-4" aria-labelledby="prediction-lifecycle-heading">
      <h2
        id="prediction-lifecycle-heading"
        className="text-base font-semibold text-foreground"
      >
        Timeline
      </h2>
      <ol className="m-0 list-none space-y-0 border-s-2 border-border ps-6">
        {steps.map((stepId, index) => {
          const isLast = index === steps.length - 1;
          const isActive = isActiveTimelineStep(stepId);

          return (
            <li
              key={stepId}
              data-timeline-step={stepId}
              className={`relative ${isLast ? '' : 'pb-6'}`}
              {...(isActive ? { 'aria-current': 'step' as const } : {})}
            >
              <span
                className={dotClassFor(isActive)}
                aria-hidden
              />
              {TIMELINE_STEP_RENDERERS[stepId](stepContext)}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
