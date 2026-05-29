'use client';

import { memo } from 'react';
import {
  TopicBucketTabs,
  type TopicBucketTab,
} from '@/components/home/TopicBucketTabs';
import {
  PredictionSortFilterPanel,
  PredictionSortFilterToolbar,
} from '@/components/predictions/PredictionSortFilterControls';
import { PredictionGrid } from '@/components/predictions/PredictionGrid';
import { outcomeLabels } from '@/components/predictions/outcome-display';
import { useCollapsibleSortFilters } from '@/hooks/useCollapsibleSortFilters';
import type { Outcome, Prediction, PredictionListSort } from '@/types/prediction';

/** Single-instance ID for home browse sort controls (toolbar + panel). */
export const HOME_BROWSE_SORT_CONTROLS_ID = 'home-browse-sort-tabs';

export type BrowseForecastsSectionProps = {
  topicTab: TopicBucketTab;
  onTopicTabChange: (tab: TopicBucketTab) => void;
  listSort: PredictionListSort;
  onListSortChange: (sort: PredictionListSort) => void;
  outcomeFilter: Outcome | 'all';
  onOutcomeFilter: (outcome: Outcome) => void;
  onClearOutcomeFilter: () => void;
  predictions: Prediction[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  emptyMessage: string;
  onRetry: () => void | Promise<void>;
  onLoadMore: () => void | Promise<void>;
};

export const BrowseForecastsSection = memo(function BrowseForecastsSection({
  topicTab,
  onTopicTabChange,
  listSort,
  onListSortChange,
  outcomeFilter,
  onOutcomeFilter,
  onClearOutcomeFilter,
  predictions,
  loading,
  loadingMore,
  error,
  hasMore,
  emptyMessage,
  onRetry,
  onLoadMore,
}: BrowseForecastsSectionProps) {
  const {
    sortFiltersOpen,
    toggleSortFilters,
    sortToggleRef,
    sortPanelRef,
  } = useCollapsibleSortFilters();

  return (
    <section className="space-y-4" aria-labelledby="forecasts-heading">
      <div>
        <div className="flex items-center justify-between gap-4">
          <h2
            id="forecasts-heading"
            className="font-serif text-2xl font-normal tracking-tight text-foreground sm:text-3xl"
          >
            Browse forecasts
          </h2>
          <PredictionSortFilterToolbar
            controlsId={HOME_BROWSE_SORT_CONTROLS_ID}
            listSort={listSort}
            loading={loading}
            hasLoadedRows={predictions.length > 0}
            sortFiltersOpen={sortFiltersOpen}
            toggleSortFilters={toggleSortFilters}
            sortToggleRef={sortToggleRef}
          />
        </div>
        {outcomeFilter !== 'all'
          ? (
              <div
                className="mt-3 flex flex-wrap items-center gap-2"
                role="status"
                aria-live="polite"
              >
                <span className="text-sm text-muted">
                  Showing:
                  {' '}
                  <span className="font-medium text-foreground">
                    {outcomeLabels[outcomeFilter]}
                  </span>
                </span>
                <button
                  type="button"
                  className="inline-flex min-h-11 p-0 shrink-0 items-center justify-center rounded-full border border-border bg-surface-elevated text-foreground hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  onClick={onClearOutcomeFilter}
                >
                  <span className="inline-flex items-center gap-1 rounded-full text-sm font-medium px-2 py-0.5">
                    Clear status filter
                  </span>
                </button>
              </div>
            )
          : null}
      </div>

      {error
        ? (
            <div
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-error/35 bg-error/10 px-4 py-3 text-sm text-error"
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
            >
              <span>{error}</span>
              <button
                type="button"
                className="rounded-lg bg-error px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                onClick={onRetry}
              >
                Retry
              </button>
            </div>
          )
        : null}

      <TopicBucketTabs
        active={topicTab}
        onChange={onTopicTabChange}
        disabled={loading && predictions.length === 0}
        showLegend={false}
      />

      <PredictionSortFilterPanel
        id={HOME_BROWSE_SORT_CONTROLS_ID}
        listSort={listSort}
        onChange={onListSortChange}
        disabled={loading && predictions.length === 0}
        sortFiltersOpen={sortFiltersOpen}
        sortPanelRef={sortPanelRef}
      />

      <PredictionGrid
        predictions={predictions}
        loading={loading}
        emptyMessage={emptyMessage}
        outcomeFilter={outcomeFilter}
        onOutcomeFilter={onOutcomeFilter}
      />

      {hasMore && predictions.length > 0
        ? (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                className="rounded-full border border-border bg-surface-elevated px-6 py-2.5 text-sm font-medium text-foreground shadow-sm hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50"
                disabled={loadingMore}
                onClick={onLoadMore}
              >
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )
        : null}
    </section>
  );
});
