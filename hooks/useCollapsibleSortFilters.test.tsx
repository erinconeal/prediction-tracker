import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { useCollapsibleSortFilters } from './useCollapsibleSortFilters';

function SortFiltersFixture() {
  const {
    sortFiltersOpen,
    toggleSortFilters,
    sortToggleRef,
    sortPanelRef,
  } = useCollapsibleSortFilters();

  return (
    <div>
      <button
        ref={sortToggleRef}
        type="button"
        aria-expanded={sortFiltersOpen}
        onClick={toggleSortFilters}
      >
        {sortFiltersOpen ? 'Hide sort options' : 'Show sort options'}
      </button>
      <div ref={sortPanelRef} hidden={!sortFiltersOpen}>
        <label>
          Newest
          <input type="radio" name="sort" value="newest" />
        </label>
        <label>
          Other
          <input type="radio" name="sort" value="other" />
        </label>
      </div>
    </div>
  );
}

describe('useCollapsibleSortFilters', () => {
  test('given panel opened, should focus the first sort option', () => {
    render(<SortFiltersFixture />);

    fireEvent.click(screen.getByRole('button', { name: /show sort options/i }));

    expect(screen.getByRole('radio', { name: /newest/i })).toHaveFocus();
  });

  test('given panel closed after open, should return focus to the toggle', () => {
    render(<SortFiltersFixture />);

    const toggle = screen.getByRole('button', { name: /show sort options/i });
    fireEvent.click(toggle);
    fireEvent.click(screen.getByRole('button', { name: /hide sort options/i }));

    expect(toggle).toHaveFocus();
  });

  test('given panel opened with a checked radio not first in DOM, should focus the checked option', () => {
    function CheckedNotFirstFixture() {
      const {
        sortFiltersOpen,
        toggleSortFilters,
        sortToggleRef,
        sortPanelRef,
      } = useCollapsibleSortFilters();

      return (
        <div>
          <button
            ref={sortToggleRef}
            type="button"
            onClick={toggleSortFilters}
          >
            Toggle
          </button>
          <div ref={sortPanelRef} hidden={!sortFiltersOpen}>
            <label>
              Other
              <input type="radio" name="sort" value="other" />
            </label>
            <label>
              Newest
              <input type="radio" name="sort" value="newest" defaultChecked />
            </label>
          </div>
        </div>
      );
    }

    render(<CheckedNotFirstFixture />);
    fireEvent.click(screen.getByRole('button', { name: /toggle/i }));

    expect(screen.getByRole('radio', { name: /newest/i })).toHaveFocus();
    expect(screen.getByRole('radio', { name: /other/i })).not.toHaveFocus();
  });
});
