import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { PredictionSortTabs } from './PredictionSortTabs';
import { SORT_RECENTLY_FINISHED } from '@/lib/lifecycle-copy';

describe('PredictionSortTabs', () => {
  test('given default props, should show a visible Sort by legend', () => {
    render(
      <PredictionSortTabs value="newest" onChange={vi.fn()} />,
    );

    expect(screen.getByText('Sort by')).toBeVisible();
  });

  test('given hideLegend, should keep the sort group labeled for assistive tech', () => {
    render(
      <PredictionSortTabs value="newest" onChange={vi.fn()} hideLegend />,
    );

    expect(screen.getByRole('group', { name: /sort by/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /^newest$/i })).toBeInTheDocument();
    expect(screen.queryByText('Sort by')).not.toBeInTheDocument();
  });

  test('given recently_finished is active, clicking info should not change sort', () => {
    const onChange = vi.fn();
    render(
      <PredictionSortTabs value="recently_finished" onChange={onChange} />,
    );

    const radio = screen.getByRole('radio', {
      name: new RegExp(SORT_RECENTLY_FINISHED, 'i'),
    });
    expect(radio).toBeChecked();

    fireEvent.click(
      screen.getByRole('button', {
        name: `About ${SORT_RECENTLY_FINISHED} sort`,
      }),
    );

    expect(onChange).not.toHaveBeenCalled();
    expect(radio).toBeChecked();
  });
});
