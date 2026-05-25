import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { DiscoveryFeedLayout } from './DiscoveryFeedLayout';

function renderLayout(
  outcomeFilter: 'all' | 'incorrect',
  onClearOutcomeFilter = vi.fn(),
) {
  return render(
    <DiscoveryFeedLayout
      header={<h1>Feed</h1>}
      emptyMessage="No forecasts"
      listSort="newest"
      onListSortChange={vi.fn()}
      outcomeFilter={outcomeFilter}
      onOutcomeFilter={vi.fn()}
      onClearOutcomeFilter={onClearOutcomeFilter}
      listData={[]}
      loading={false}
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

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /clear status filter/i }),
    ).not.toBeInTheDocument();
  });
});
