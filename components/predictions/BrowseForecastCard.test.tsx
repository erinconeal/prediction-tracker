import '@/test/mocks/use-topic-catalog';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { buildPrediction } from '@/test/factories/prediction';
import { BrowseForecastCard } from './BrowseForecastCard';

const TOPIC_AI = 'topic-ai-regulation-2026';

const cardPrediction = (overrides: Parameters<typeof buildPrediction>[0] = {}) =>
  buildPrediction({
    id: 'p-1',
    source: 'Jane Analyst',
    sourceSlug: 'jane',
    text: 'Will rates fall this year?',
    topicIds: ['topic-finance'],
    created_at: '2024-06-01T00:00:00.000Z',
    outcome: 'incorrect',
    ...overrides,
  });

describe('BrowseForecastCard', () => {
  test('exposes separate links for title, topic, and source without a wrapping card link', () => {
    const { container } = render(
      <BrowseForecastCard
        prediction={cardPrediction()}
        onOutcomeFilter={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('link', { name: /will rates fall/i }),
    ).toHaveAttribute('href', '/predictions/p-1');
    expect(screen.getByRole('link', { name: /jane analyst/i })).toHaveAttribute(
      'href',
      '/source/jane',
    );
    expect(screen.getByRole('link', { name: /browse finance forecasts/i })).toHaveAttribute(
      'href',
      '/finance',
    );
    expect(container.querySelector('article > a')).toBeNull();
  });

  test('outcome badge filters browse feed when clicked', () => {
    const onOutcomeFilter = vi.fn();
    render(
      <BrowseForecastCard
        prediction={cardPrediction()}
        onOutcomeFilter={onOutcomeFilter}
      />,
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: /filter browse forecasts by incorrect/i,
      }),
    );

    expect(onOutcomeFilter).toHaveBeenCalledWith('incorrect');
  });

  test('outcome filter button does not use aria-pressed (filter state is in page header)', () => {
    render(
      <BrowseForecastCard
        prediction={cardPrediction()}
        onOutcomeFilter={vi.fn()}
      />,
    );

    expect(
      screen.getByRole('button', {
        name: /filter browse forecasts by incorrect/i,
      }),
    ).not.toHaveAttribute('aria-pressed');
  });

  test('track record corner is not used', () => {
    render(
      <BrowseForecastCard
        prediction={cardPrediction()}
        onOutcomeFilter={vi.fn()}
      />,
    );

    expect(screen.queryByText('Track record')).not.toBeInTheDocument();
  });

  test('shows timing line with semantic time element between title and footer', () => {
    render(
      <BrowseForecastCard
        prediction={cardPrediction({
          target_date: null,
          outcome: 'incorrect',
          resolved_at: '2024-07-15T00:00:00.000Z',
        })}
        onOutcomeFilter={vi.fn()}
      />,
    );

    const time = screen.getByText('Jul 15, 2024');
    expect(time.tagName).toBe('TIME');
    expect(time).toHaveAttribute('datetime', '2024-07-15T00:00:00.000Z');
    expect(time.closest('p')).toHaveTextContent('Resolved Jul 15, 2024');
  });

  test('topic in footer is shown when prediction has topics', () => {
    render(
      <BrowseForecastCard
        prediction={cardPrediction({ topicIds: [TOPIC_AI] })}
        onOutcomeFilter={vi.fn()}
      />,
    );
    expect(
      screen.getByRole('link', { name: /browse ai regulation 2026 forecasts/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText('+1')).not.toBeInTheDocument();
  });

  test('topic in footer is not shown when prediction has no topics', () => {
    render(
      <BrowseForecastCard
        prediction={cardPrediction({ topicIds: [] })}
        onOutcomeFilter={vi.fn()}
      />,
    );
    expect(screen.queryByRole('link', { name: 'AI regulation 2026' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /browse finance forecasts/i })).not.toBeInTheDocument();
    expect(screen.queryByText('+1')).not.toBeInTheDocument();
  });
});
