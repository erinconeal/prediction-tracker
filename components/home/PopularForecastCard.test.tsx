import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { Prediction } from '@/types/prediction';
import { PopularForecastCard } from './PopularForecastCard';

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

const mockGetTopicsByIds = vi.fn<(ids: string[]) => { id: string; slug: string; name: string }[]>(
  () => [],
);

vi.mock('@/hooks/useTopicCatalog', () => ({
  useTopicCatalog: () => ({
    topics: [],
    loading: false,
    getTopicsByIds: mockGetTopicsByIds,
  }),
}));

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
    outcome: 'pending',
    ...overrides,
  };
}

describe('PopularForecastCard', () => {
  beforeEach(() => {
    mockGetTopicsByIds.mockReset();
    mockGetTopicsByIds.mockReturnValue([]);
  });

  test('given a forecast, should show category link in footer', () => {
    render(
      <PopularForecastCard
        prediction={prediction()}
        statsContext={[prediction()]}
      />,
    );

    expect(
      screen.getByRole('link', { name: /browse finance forecasts/i }),
    ).toHaveAttribute('href', '/category/finance');
  });

  test('given topicIds on the prediction, should not render topic footer links', () => {
    mockGetTopicsByIds.mockImplementation((ids: string[]) =>
      ids.includes('topic-ai')
        ? [
            {
              id: 'topic-ai',
              slug: 'ai-regulation-2026',
              name: 'AI regulation 2026',
            },
          ]
        : [],
    );

    const { container } = render(
      <PopularForecastCard
        prediction={prediction({ topicIds: ['topic-ai'] })}
        statsContext={[prediction({ topicIds: ['topic-ai'] })]}
      />,
    );

    expect(mockGetTopicsByIds).toHaveBeenCalledWith([]);
    expect(
      screen.queryByRole('link', { name: /ai regulation/i }),
    ).not.toBeInTheDocument();
    expect(container.querySelector('a[href^="/topics/"]')).toBeNull();
  });

  test('given no scored predictions for the source, should show unavailable accuracy badge', () => {
    render(
      <PopularForecastCard
        prediction={prediction()}
        statsContext={[
          prediction({ id: 'p-pending', outcome: 'pending', resolved_at: null }),
        ]}
      />,
    );

    expect(screen.getByText('— accurate')).toBeInTheDocument();
    expect(
      screen.getByLabelText(/source accuracy unavailable/i),
    ).toBeInTheDocument();
  });

  test('given scored source stats, should expose accuracy percent in aria-label', () => {
    const statsContext = [
      prediction({
        id: 'p-1',
        outcome: 'correct',
        resolved_at: '2024-07-01T00:00:00.000Z',
      }),
      prediction({
        id: 'p-2',
        outcome: 'incorrect',
        resolved_at: '2024-07-02T00:00:00.000Z',
      }),
    ];

    render(
      <PopularForecastCard
        prediction={prediction()}
        statsContext={statsContext}
      />,
    );

    expect(
      screen.getByLabelText(/source accuracy 50 percent/i),
    ).toBeInTheDocument();
  });

  test('given a forecast, should show source accuracy badge', () => {
    const statsContext = [
      prediction({
        id: 'p-1',
        outcome: 'correct',
        resolved_at: '2024-07-01T00:00:00.000Z',
      }),
      prediction({
        id: 'p-2',
        outcome: 'incorrect',
        resolved_at: '2024-07-02T00:00:00.000Z',
      }),
    ];

    render(
      <PopularForecastCard
        prediction={prediction()}
        statsContext={statsContext}
      />,
    );

    expect(screen.getByText('50% accurate')).toBeInTheDocument();
  });

  test('exposes title and source links; accuracy badge is not a button', () => {
    render(
      <PopularForecastCard
        prediction={prediction()}
        statsContext={[prediction()]}
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
      screen.getByLabelText(/source accuracy unavailable/i),
    ).not.toHaveAttribute('role', 'button');
  });
});
