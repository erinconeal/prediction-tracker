import '@/test/mocks/use-topic-catalog';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import type { Prediction, PredictionListSort } from '@/types/prediction';
import { buildIndexedPrediction } from '@/test/factories/prediction';
import { DiscoveryFeedLayout } from './DiscoveryFeedLayout';

function renderLayout(
  outcomeFilter: 'all' | 'incorrect',
  onClearOutcomeFilter = vi.fn(),
  options: {
    listSort?: PredictionListSort;
    listData?: Prediction[];
    loading?: boolean;
    onListSortChange?: (sort: PredictionListSort) => void;
  } = {},
) {
  return render(
    <DiscoveryFeedLayout
      title={<h1>Feed</h1>}
      emptyMessage="No forecasts"
      listSort={options.listSort ?? 'newest'}
      onListSortChange={options.onListSortChange ?? vi.fn()}
      outcomeFilter={outcomeFilter}
      onOutcomeFilter={vi.fn()}
      onClearOutcomeFilter={onClearOutcomeFilter}
      listData={options.listData ?? []}
      loading={options.loading ?? false}
      loadingMore={false}
      error={null}
      hasMore={false}
      onRetry={vi.fn()}
      onLoadMore={vi.fn()}
      sidebar={<div>Sidebar</div>}
    />,
  );
}

describe('DiscoveryFeedLayout', () => {
  test('given active outcome filter, should expose polite status region and clear control', () => {
    const onClearOutcomeFilter = vi.fn();
    renderLayout('incorrect', onClearOutcomeFilter);

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveTextContent('Showing:');
    expect(status).toHaveTextContent('Incorrect');

    fireEvent.click(screen.getByRole('button', { name: /clear status filter/i }));
    expect(onClearOutcomeFilter).toHaveBeenCalledOnce();
  });

  test('given outcome filter all, should not render status region', () => {
    renderLayout('all');

    expect(screen.queryByRole('status', { name: /showing:/i })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /clear status filter/i }),
    ).not.toBeInTheDocument();
  });

  test('given loaded feed, sort tabs should be hidden until toggled', () => {
    renderLayout('all', vi.fn(), {
      listData: [buildIndexedPrediction(0)],
    });

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

  test('given non-default sort with collapsed panel, should show visible sorted label', () => {
    renderLayout('all', vi.fn(), {
      listSort: 'source_accuracy',
      listData: [buildIndexedPrediction(0)],
    });

    expect(screen.getByText(/sorted:/i)).toHaveTextContent('Most accurate source');
    expect(screen.queryByRole('radio', { name: /most accurate source/i }))
      .not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /show sort options/i }),
    ).toBeInTheDocument();
  });
});
