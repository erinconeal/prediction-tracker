import type { ComponentProps, ReactNode } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import type { Prediction } from '@/types/prediction';
import {
  BrowseForecastsSection,
  HOME_BROWSE_SORT_CONTROLS_ID,
} from './BrowseForecastsSection';

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

function prediction(id: string): Prediction {
  return {
    id,
    source: 'Source',
    sourceSlug: 'source',
    text: `Prediction ${id}`,
    topicIds: [],
    created_at: '2024-01-01T00:00:00.000Z',
    resolved_at: null,
    target_date: null,
    outcome: 'pending',
  };
}

function defaultProps(
  overrides: Partial<ComponentProps<typeof BrowseForecastsSection>> = {},
) {
  return {
    topicTab: 'All' as const,
    onTopicTabChange: vi.fn(),
    listSort: 'newest' as const,
    onListSortChange: vi.fn(),
    outcomeFilter: 'all' as const,
    onOutcomeFilter: vi.fn(),
    onClearOutcomeFilter: vi.fn(),
    predictions: [] as Prediction[],
    loading: false,
    loadingMore: false,
    error: null,
    hasMore: false,
    emptyMessage: 'No forecasts yet.',
    onRetry: vi.fn(),
    onLoadMore: vi.fn(),
    ...overrides,
  };
}

describe('BrowseForecastsSection', () => {
  test('given loaded section, should use Browse forecasts as section title', () => {
    render(
      <BrowseForecastsSection
        {...defaultProps({ predictions: [prediction('a')] })}
      />,
    );

    expect(
      screen.getByRole('heading', { level: 2, name: 'Browse forecasts' }),
    ).toBeInTheDocument();
  });

  test('given error, should call onRetry when Retry is clicked', () => {
    const onRetry = vi.fn();
    render(
      <BrowseForecastsSection
        {...defaultProps({ error: 'offline', onRetry })}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /retry/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test('given more rows available, should call onLoadMore when Load more is clicked', () => {
    const onLoadMore = vi.fn();
    render(
      <BrowseForecastsSection
        {...defaultProps({
          predictions: [prediction('a')],
          hasMore: true,
          onLoadMore,
        })}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /^load more$/i }));
    expect(onLoadMore).toHaveBeenCalledTimes(1);
  });

  test('given loaded section, should hide sort tabs until toggled', () => {
    render(
      <BrowseForecastsSection
        {...defaultProps({ predictions: [prediction('a')] })}
      />,
    );

    expect(document.getElementById(HOME_BROWSE_SORT_CONTROLS_ID)).toBeTruthy();
    expect(screen.queryByRole('radio', { name: /^newest$/i })).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /show sort options/i }),
    ).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(screen.getByRole('button', { name: /show sort options/i }));

    expect(screen.getByRole('radio', { name: /^newest$/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /hide sort options/i }),
    ).toHaveAttribute('aria-expanded', 'true');
  });

  test('given active outcome filter, should call onClearOutcomeFilter when cleared', () => {
    const onClearOutcomeFilter = vi.fn();
    render(
      <BrowseForecastsSection
        {...defaultProps({
          outcomeFilter: 'incorrect',
          onClearOutcomeFilter,
        })}
      />,
    );

    expect(screen.getByText(/showing:/i)).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: /clear status filter/i }),
    );
    expect(onClearOutcomeFilter).toHaveBeenCalledTimes(1);
  });
});
