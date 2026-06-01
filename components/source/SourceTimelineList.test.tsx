import '@/test/mocks/use-topic-catalog';
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { buildPrediction } from '@/test/factories/prediction';
import { SourceTimelineList } from './SourceTimelineList';

describe('SourceTimelineList', () => {
  test('renders title link, resolved timing, and topic footer without mark buttons', () => {
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
            resolved_at: '2024-07-15T00:00:00.000Z',
          }),
        ]}
      />,
    );

    expect(
      screen.getByRole('link', { name: /rates will fall/i }),
    ).toHaveAttribute('href', '/predictions/p-timeline');
    const time = screen.getByText('Jul 15, 2024');
    expect(time.tagName).toBe('TIME');
    expect(time.closest('p')).toHaveTextContent('Resolved Jul 15, 2024');
    expect(
      screen.getByRole('link', { name: /browse finance forecasts/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /mark correct/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /jane analyst/i })).not.toBeInTheDocument();
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
