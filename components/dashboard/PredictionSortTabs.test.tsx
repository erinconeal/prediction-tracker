import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { PredictionSortTabs } from './PredictionSortTabs';

describe('PredictionSortTabs', () => {
  test('given default props, should show a visible Sort by legend', () => {
    render(
      <PredictionSortTabs value="newest" onChange={vi.fn()} />,
    );

    expect(screen.getByText('Sort by')).not.toHaveClass('sr-only');
  });

  test('given hideLegend, should hide the Sort by legend visually', () => {
    render(
      <PredictionSortTabs value="newest" onChange={vi.fn()} hideLegend />,
    );

    expect(screen.getByText('Sort by')).toHaveClass('sr-only');
  });
});
