'use client';

import { Settings2 } from 'lucide-react';
import type { RefObject } from 'react';
import {
  PredictionSortTabs,
  sortOptionLabel,
} from '@/components/dashboard/PredictionSortTabs';
import type { PredictionListSort } from '@/types/prediction';

type SortFilterToolbarProps = {
  controlsId: string;
  listSort: PredictionListSort;
  loading: boolean;
  hasLoadedRows: boolean;
  sortFiltersOpen: boolean;
  toggleSortFilters: () => void;
  sortToggleRef: RefObject<HTMLButtonElement | null>;
};

export function PredictionSortFilterToolbar({
  controlsId,
  listSort,
  loading,
  hasLoadedRows,
  sortFiltersOpen,
  toggleSortFilters,
  sortToggleRef,
}: SortFilterToolbarProps) {
  return (
    <div className="flex shrink-0 items-center gap-3">
      {loading && hasLoadedRows
        ? (
            <span
              className="text-xs text-muted"
              role="status"
              aria-live="polite"
            >
              Updating…
            </span>
          )
        : null}
      {!sortFiltersOpen && listSort !== 'newest'
        ? (
            <span className="text-sm text-muted">
              Sorted:
              {' '}
              <span className="font-medium text-foreground">
                {sortOptionLabel(listSort)}
              </span>
            </span>
          )
        : null}
      <button
        ref={sortToggleRef}
        type="button"
        className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
          listSort !== 'newest'
            ? 'text-primary'
            : 'text-muted hover:text-foreground'
        }`}
        aria-expanded={sortFiltersOpen}
        aria-controls={controlsId}
        onClick={toggleSortFilters}
      >
        <Settings2 className="size-5" aria-hidden strokeWidth={1.75} />
        <span className="sr-only">
          {sortFiltersOpen ? 'Hide sort options' : 'Show sort options'}
        </span>
      </button>
    </div>
  );
}

type SortFilterPanelProps = {
  id: string;
  listSort: PredictionListSort;
  onChange: (sort: PredictionListSort) => void;
  disabled?: boolean;
  sortFiltersOpen: boolean;
  sortPanelRef: RefObject<HTMLDivElement | null>;
};

export function PredictionSortFilterPanel({
  id,
  listSort,
  onChange,
  disabled = false,
  sortFiltersOpen,
  sortPanelRef,
}: SortFilterPanelProps) {
  return (
    <div
      ref={sortPanelRef}
      hidden={!sortFiltersOpen}
      className={
        sortFiltersOpen
          ? 'animate-sort-filters-enter motion-reduce:animate-none'
          : undefined
      }
    >
      <PredictionSortTabs
        id={id}
        value={listSort}
        onChange={onChange}
        disabled={disabled}
        hideLegend
      />
    </div>
  );
}
