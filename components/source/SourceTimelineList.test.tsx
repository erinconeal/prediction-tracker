import '@/test/mocks/use-topic-catalog';
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { buildPrediction } from '@/test/factories/prediction';
import { SourceTimelineList } from './SourceTimelineList';

describe('SourceTimelineList', () => {
  test('renders title link, outcome badge, and topic footer without mark buttons', async () => {
    render(
      <SourceTimelineList
        loading={false}
        predictions={[
          buildPrediction({
            id: 'p-timeline',
            text: 'Rates will fall before year end',
            source: 'Jane Analyst',
            sourceSlug: 'jane-analyst',
            topicIds: ['topic-finance'],
            outcome: 'correct',
            finished_at: '2024-07-15T00:00:00.000Z',
          }),
        ]}
      />,
    );

    expect(
      screen.getByRole('link', { name: /rates will fall/i }),
    ).toHaveAttribute('href', '/predictions/p-timeline');
    expect(screen.getByText('Correct')).toBeInTheDocument();
    expect(screen.getByText('Finished')).toBeInTheDocument();
    expect(screen.getByText('Jul 15, 2024')).toBeInTheDocument();
    expect(
      await screen.findByRole('link', { name: /browse finance forecasts/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /mark correct/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /jane analyst/i })).not.toBeInTheDocument();
  });

  test('shows Submitted date for still-open forecasts', () => {
    render(
      <SourceTimelineList
        loading={false}
        predictions={[
          buildPrediction({
            id: 'p-open',
            text: 'Open forecast text',
            outcome: 'still_open',
            created_at: '2024-06-01T00:00:00.000Z',
            finished_at: null,
          }),
        ]}
      />,
    );

    expect(screen.getByText('Submitted')).toBeInTheDocument();
    expect(screen.getByText('Jun 1, 2024')).toBeInTheDocument();
  });

  test('shows empty message when there are no predictions', () => {
    render(
      <SourceTimelineList
        loading={false}
        predictions={[]}
        emptyMessage="No forecasts recorded for this source yet."
      />,
    );

    expect(
      screen.getByText('No forecasts recorded for this source yet.'),
    ).toBeInTheDocument();
  });
});
