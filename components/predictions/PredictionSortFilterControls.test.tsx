import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, test, vi } from 'vitest';
import {
  PredictionSortFilterPanel,
  PredictionSortFilterToolbar,
} from './PredictionSortFilterControls';

describe('PredictionSortFilterToolbar', () => {
  test('given loading with rows, should show updating status', () => {
    render(
      <PredictionSortFilterToolbar
        controlsId="sort-tabs"
        listSort="newest"
        loading
        hasLoadedRows
        sortFiltersOpen={false}
        toggleSortFilters={vi.fn()}
        sortToggleRef={createRef()}
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent('Updating…');
  });

  test('given non-default sort and collapsed panel, should show sorted label', () => {
    render(
      <PredictionSortFilterToolbar
        controlsId="sort-tabs"
        listSort="source_accuracy"
        loading={false}
        hasLoadedRows
        sortFiltersOpen={false}
        toggleSortFilters={vi.fn()}
        sortToggleRef={createRef()}
      />,
    );

    expect(screen.getByText(/sorted:/i)).toHaveTextContent('Most accurate source');
  });

  test('given non-default sort, should style toggle as active', () => {
    render(
      <PredictionSortFilterToolbar
        controlsId="sort-tabs"
        listSort="source_accuracy"
        loading={false}
        hasLoadedRows={false}
        sortFiltersOpen={false}
        toggleSortFilters={vi.fn()}
        sortToggleRef={createRef()}
      />,
    );

    expect(screen.getByRole('button', { name: /show sort options/i }))
      .toHaveClass('text-primary');
  });
});

describe('PredictionSortFilterPanel', () => {
  test('given collapsed panel, should hide sort controls from accessibility tree', () => {
    render(
      <PredictionSortFilterPanel
        id="sort-tabs"
        listSort="newest"
        onChange={vi.fn()}
        sortFiltersOpen={false}
        sortPanelRef={createRef()}
      />,
    );

    const panel = document.getElementById('sort-tabs')?.parentElement;
    expect(panel).toHaveAttribute('hidden');
    expect(screen.queryByRole('radio', { name: /^newest$/i })).not.toBeInTheDocument();
  });

  test('given open panel, should expose sort radios', () => {
    render(
      <PredictionSortFilterPanel
        id="sort-tabs"
        listSort="newest"
        onChange={vi.fn()}
        sortFiltersOpen
        sortPanelRef={createRef()}
      />,
    );

    expect(screen.getByRole('radio', { name: /^newest$/i })).toBeInTheDocument();
  });
});
