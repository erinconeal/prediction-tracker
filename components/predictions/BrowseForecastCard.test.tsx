import type { ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import type { Prediction } from '@/types/prediction';
import { BrowseForecastCard } from './BrowseForecastCard';
import { getTopicsByIds } from '@/lib/topic-store';

// mock next/link to allow testing of links in child components
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...rest
  }: {
    children: ReactNode;
    href: string;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock('@/hooks/useTopicCatalog', () => ({
  useTopicCatalog: () => ({
    getTopicsByIds,
  }),
}));

const TOPIC_AI = 'topic-ai-regulation-2026';

function prediction(overrides: Partial<Prediction> = {}): Prediction {
  return {
    id: 'p-1',
    source: 'Jane Analyst',
    sourceSlug: 'jane',
    text: 'Will rates fall this year?',
    category: 'Finance',
    topicIds: [],
    created_at: '2024-06-01T00:00:00.000Z',
    resolved_at: null,
    target_date: null,
    outcome: 'incorrect',
    ...overrides,
  };
}

describe('BrowseForecastCard', () => {
  test('exposes separate links for title, category, and source without a wrapping card link', () => {
    const { container } = render(
      <BrowseForecastCard
        prediction={prediction()}
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
      '/category/finance',
    );
    expect(container.querySelector('article > a')).toBeNull();
  });

  test('outcome badge filters browse feed when clicked', () => {
    const onOutcomeFilter = vi.fn();
    render(
      <BrowseForecastCard
        prediction={prediction()}
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
        prediction={prediction()}
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
        prediction={prediction()}
        onOutcomeFilter={vi.fn()}
      />,
    );

    expect(screen.queryByText('Track record')).not.toBeInTheDocument();
  });

  test('shows target or added timing between title and footer', () => {
    const { rerender } = render(
      <BrowseForecastCard
        prediction={prediction({ target_date: '2025-03-15T00:00:00.000Z' })}
        onOutcomeFilter={vi.fn()}
      />,
    );

    expect(screen.getByText(/target mar 2025/i)).toBeInTheDocument();

    rerender(
      <BrowseForecastCard
        prediction={prediction({ target_date: null })}
        onOutcomeFilter={vi.fn()}
      />,
    );

    expect(screen.getByText(/^Added /i)).toBeInTheDocument();
  });

  test('topic in footer is shown when prediction has topics', () => {
    render(
      <BrowseForecastCard
        prediction={prediction({ topicIds: [TOPIC_AI] })}
        onOutcomeFilter={vi.fn()}
      />,
    );
    expect(screen.getByRole('link', { name: 'AI regulation 2026' })).toBeInTheDocument();
    expect(screen.queryByText('+1')).not.toBeInTheDocument();
  });

  test('topic in footer is not shown when prediction has no topics', () => {
    render(
      <BrowseForecastCard
        prediction={prediction({ topicIds: [] })}
        onOutcomeFilter={vi.fn()}
      />,
    );
    expect(screen.queryByRole('link', { name: 'AI regulation 2026' })).not.toBeInTheDocument();
    expect(screen.queryByText('+1')).not.toBeInTheDocument();
  });
});
