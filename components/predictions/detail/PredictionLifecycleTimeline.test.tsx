import { outcomeLabels } from '@/components/predictions/outcome-display';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import type { Outcome } from '@/types/prediction';
import type { TimelineStepId } from '@/lib/prediction-lifecycle-timeline';
import { PredictionLifecycleTimeline } from './PredictionLifecycleTimeline';
import { TIMELINE_FINISHED_LABEL } from '@/lib/lifecycle-copy';

function getTimelineSection(): HTMLElement {
  return screen.getByRole('region', { name: 'Timeline' });
}

function timelineStepIds(section: HTMLElement): TimelineStepId[] {
  return within(section)
    .getAllByRole('listitem')
    .map(item => item.getAttribute('data-timeline-step') as TimelineStepId);
}

describe('PredictionLifecycleTimeline', () => {
  test('given a still-open prediction without target, should show Added then Outcome with badge', () => {
    render(
      <PredictionLifecycleTimeline
        createdAt="2024-01-15T00:00:00.000Z"
        targetDate={null}
        finishedAt={null}
        outcome="still_open"
      />,
    );

    const section = getTimelineSection();

    expect(within(section).getByText('Still open')).toBeInTheDocument();
    expect(screen.queryByText(TIMELINE_FINISHED_LABEL)).not.toBeInTheDocument();
    expect(timelineStepIds(section)).toEqual(['added', 'outcome']);

    const outcomeStep = within(section).getByRole('listitem', {
      current: 'step',
    });
    expect(outcomeStep).toHaveAttribute('data-timeline-step', 'outcome');
  });

  test('given a still-open prediction with target, should order Outcome before Target', () => {
    render(
      <PredictionLifecycleTimeline
        createdAt="2024-01-15T00:00:00.000Z"
        targetDate="2026-12-01T00:00:00.000Z"
        finishedAt={null}
        outcome="still_open"
      />,
    );

    const section = getTimelineSection();
    expect(timelineStepIds(section)).toEqual(['added', 'outcome', 'target']);

    const items = within(section).getAllByRole('listitem');
    expect(items[1]).toHaveAttribute('aria-current', 'step');
    expect(items[2]).not.toHaveAttribute('aria-current');
  });

  test('given a terminal prediction, should show chronological steps and Correct badge', () => {
    render(
      <PredictionLifecycleTimeline
        createdAt="2024-01-15T00:00:00.000Z"
        targetDate="2026-12-01T00:00:00.000Z"
        finishedAt="2024-07-15T00:00:00.000Z"
        outcome="correct"
      />,
    );

    const section = getTimelineSection();
    expect(
      within(section).getByText(TIMELINE_FINISHED_LABEL),
    ).toBeInTheDocument();
    expect(within(section).getByText('Correct')).toBeInTheDocument();
    expect(timelineStepIds(section)).toEqual([
      'added',
      'target',
      'finished',
      'outcome',
    ]);

    const outcomeStep = within(section).getByRole('listitem', {
      current: 'step',
    });
    expect(outcomeStep).toHaveAttribute('data-timeline-step', 'outcome');
  });

  test('given a terminal prediction without target, should show Finished before Outcome', () => {
    render(
      <PredictionLifecycleTimeline
        createdAt="2024-01-15T00:00:00.000Z"
        targetDate={null}
        finishedAt="2024-07-15T00:00:00.000Z"
        outcome="incorrect"
      />,
    );

    const section = getTimelineSection();
    expect(within(section).getByText('Incorrect')).toBeInTheDocument();
    expect(timelineStepIds(section)).toEqual(['added', 'finished', 'outcome']);
  });

  test('given a terminal prediction without finished_at, should omit Finished step', () => {
    render(
      <PredictionLifecycleTimeline
        createdAt="2024-01-15T00:00:00.000Z"
        targetDate="2026-12-01T00:00:00.000Z"
        finishedAt={null}
        outcome="unresolved"
      />,
    );

    const section = getTimelineSection();
    expect(within(section).getByText('Unresolved')).toBeInTheDocument();
    expect(
      within(section).queryByText(TIMELINE_FINISHED_LABEL),
    ).not.toBeInTheDocument();
    expect(timelineStepIds(section)).toEqual(['added', 'target', 'outcome']);
  });

  test.each<Outcome>(['incorrect', 'unresolved', 'invalid'])(
    'given a terminal %s outcome, should show the matching outcome badge',
    (outcome) => {
      render(
        <PredictionLifecycleTimeline
          createdAt="2024-01-15T00:00:00.000Z"
          targetDate={null}
          finishedAt="2024-07-15T00:00:00.000Z"
          outcome={outcome}
        />,
      );

      const section = getTimelineSection();
      expect(within(section).getByText(outcomeLabels[outcome])).toBeInTheDocument();
      expect(timelineStepIds(section)).toEqual(['added', 'finished', 'outcome']);
    },
  );
});
