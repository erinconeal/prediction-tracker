import { render, screen, within } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { PredictionLifecycleTimeline } from './PredictionLifecycleTimeline';
import { TIMELINE_FINISHED_LABEL } from '@/lib/lifecycle-copy';

describe('PredictionLifecycleTimeline', () => {
  test('given a still-open prediction, should describe outcome without finished step', () => {
    render(
      <PredictionLifecycleTimeline
        createdAt="2024-01-15T00:00:00.000Z"
        targetDate={null}
        finishedAt={null}
        outcome="still_open"
      />,
    );

    expect(
      screen.getByText('Still open — outcome not yet recorded.'),
    ).toBeInTheDocument();
    expect(screen.queryByText(TIMELINE_FINISHED_LABEL)).not.toBeInTheDocument();
  });

  test('given a terminal prediction, should show finished step and outcome copy', () => {
    render(
      <PredictionLifecycleTimeline
        createdAt="2024-01-15T00:00:00.000Z"
        targetDate="2026-12-01T00:00:00.000Z"
        finishedAt="2024-07-15T00:00:00.000Z"
        outcome="correct"
      />,
    );

    const section = screen.getByRole('heading', { name: 'Timeline' }).closest('section');
    expect(section).not.toBeNull();
    expect(
      within(section as HTMLElement).getByText(TIMELINE_FINISHED_LABEL),
    ).toBeInTheDocument();
    expect(
      within(section as HTMLElement).getByText(
        'Recorded as correct against the evaluation criteria you apply for this tracker.',
      ),
    ).toBeInTheDocument();
  });
});
