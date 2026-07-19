import '@/test/mocks/use-topic-catalog';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { buildPrediction } from '@/test/factories/prediction';
import { PopularForecastCard } from './PopularForecastCard';

const cardPrediction = (overrides: Parameters<typeof buildPrediction>[0] = {}) =>
  buildPrediction({
    id: 'p-1',
    source: 'Jane Analyst',
    sourceSlug: 'jane',
    text: 'Will rates fall this year?',
    topicIds: ['topic-finance'],
    created_at: '2024-06-01T00:00:00.000Z',
    outcome: 'still_open',
    ...overrides,
  });

describe('PopularForecastCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('given a forecast, should show primary topic link in footer', async () => {
    render(
      <PopularForecastCard
        prediction={cardPrediction()}
        statsContext={[cardPrediction()]}
      />,
    );

    expect(
      await screen.findByRole('link', { name: /browse finance forecasts/i }),
    ).toHaveAttribute('href', '/finance');
  });

  test('given topicIds on the prediction, should render topic footer link', async () => {
    render(
      <PopularForecastCard
        prediction={cardPrediction({ topicIds: ['topic-ai-regulation-2026'] })}
        statsContext={[cardPrediction({ topicIds: ['topic-ai-regulation-2026'] })]}
      />,
    );

    expect(
      await screen.findByRole('link', { name: /browse ai regulation 2026 forecasts/i }),
    ).toHaveAttribute('href', '/ai-regulation-2026');
  });

  test('given no scored predictions for the source, should show unavailable accuracy badge', () => {
    render(
      <PopularForecastCard
        prediction={cardPrediction()}
        statsContext={[
          cardPrediction({ id: 'p-still-open', outcome: 'still_open', finished_at: null }),
        ]}
      />,
    );

    expect(screen.getByText('—')).toBeInTheDocument();
    expect(
      screen.getByLabelText(/source accuracy unavailable for this source/i),
    ).toBeInTheDocument();
  });

  test('given scored source stats, should expose accuracy percent in aria-label', () => {
    const statsContext = [
      cardPrediction({
        id: 'p-1',
        outcome: 'correct',
        finished_at: '2024-07-01T00:00:00.000Z',
      }),
      cardPrediction({
        id: 'p-2',
        outcome: 'incorrect',
        finished_at: '2024-07-02T00:00:00.000Z',
      }),
    ];

    render(
      <PopularForecastCard
        prediction={cardPrediction()}
        statsContext={statsContext}
      />,
    );

    expect(
      screen.getByLabelText(/source accuracy 50 percent, mixed track record/i),
    ).toBeInTheDocument();
  });

  test('given a forecast, should show source accuracy badge', () => {
    const statsContext = [
      cardPrediction({
        id: 'p-1',
        outcome: 'correct',
        finished_at: '2024-07-01T00:00:00.000Z',
      }),
      cardPrediction({
        id: 'p-2',
        outcome: 'incorrect',
        finished_at: '2024-07-02T00:00:00.000Z',
      }),
    ];

    render(
      <PopularForecastCard
        prediction={cardPrediction()}
        statsContext={statsContext}
      />,
    );

    expect(screen.getByText('50% —')).toBeInTheDocument();
  });

  test('exposes title and source links; accuracy badge is not a button', () => {
    render(
      <PopularForecastCard
        prediction={cardPrediction()}
        statsContext={[cardPrediction()]}
      />,
    );

    expect(
      screen.getByRole('link', { name: /will rates fall/i }),
    ).toHaveAttribute('href', '/predictions/p-1');
    expect(screen.getByRole('link', { name: /jane analyst/i })).toHaveAttribute(
      'href',
      '/source/jane',
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    expect(
      screen.getByLabelText(/source accuracy unavailable for this source/i),
    ).not.toHaveAttribute('role', 'button');
  });
});
