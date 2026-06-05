import { TIMELINE_FINISHED_LABEL } from '@/lib/lifecycle-copy';
import { isStillOpenOutcome } from '@/lib/prediction-outcome';
import type { Outcome } from '@/types/prediction';

export type TimelineStepId = 'added' | 'target' | 'finished' | 'outcome';

export const TIMELINE_STEP_LABELS: Record<TimelineStepId, string> = {
  added: 'Added',
  target: 'Target',
  finished: TIMELINE_FINISHED_LABEL,
  outcome: 'Outcome',
};

/**
 * Computes ordered lifecycle steps for the prediction detail timeline.
 * Still-open: Added → Outcome → Target (when a target date exists).
 * Terminal: Added → Target → Finished → Outcome, omitting steps when dates are absent.
 */
export function buildTimelineSteps(
  outcome: Outcome,
  targetDate: string | null,
  finishedAt: string | null,
): TimelineStepId[] {
  const steps: TimelineStepId[] = ['added'];

  if (isStillOpenOutcome(outcome)) {
    steps.push('outcome');
    if (targetDate) {
      steps.push('target');
    }
    return steps;
  }

  if (targetDate) {
    steps.push('target');
  }
  if (finishedAt) {
    steps.push('finished');
  }
  steps.push('outcome');

  return steps;
}

/** Whether the timeline dot for this step uses the active (primary) style. */
export function isActiveTimelineStep(stepId: TimelineStepId): boolean {
  return stepId === 'outcome';
}
