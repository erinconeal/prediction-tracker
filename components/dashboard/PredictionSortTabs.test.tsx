import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { PredictionSortTabs } from './PredictionSortTabs';
import { SORT_RECENTLY_FINISHED } from '@/lib/lifecycle-copy';

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

  test('given recently_finished tab, info trigger should not be inside the radio label', () => {
    render(
      <PredictionSortTabs value="newest" onChange={vi.fn()} />,
    );

    const infoTrigger = screen.getByRole('button', {
      name: `About ${SORT_RECENTLY_FINISHED} sort`,
    });
    expect(infoTrigger.closest('label')).toBeNull();
  });

  test('given recently_finished is active, clicking info should not change sort', () => {
    const onChange = vi.fn();
    render(
      <PredictionSortTabs value="recently_finished" onChange={onChange} />,
    );

    fireEvent.click(
      screen.getByRole('button', {
        name: `About ${SORT_RECENTLY_FINISHED} sort`,
      }),
    );

    expect(onChange).not.toHaveBeenCalled();
  });

  test('given recently_finished is active, info trigger should use on-primary styling', () => {
    render(
      <PredictionSortTabs value="recently_finished" onChange={vi.fn()} />,
    );

    const infoTrigger = screen.getByRole('button', {
      name: `About ${SORT_RECENTLY_FINISHED} sort`,
    });
    expect(infoTrigger.className).toMatch(/text-white/);
  });
});
