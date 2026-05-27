'use client';

import { Settings2 } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  PredictionSortTabs,
  sortOptionLabel,
} from '@/components/dashboard/PredictionSortTabs';
import { PredictionFeedList } from '@/components/feed/PredictionFeedList';
import { outcomeLabels } from '@/components/predictions/outcome-display';
import type { Outcome, Prediction, PredictionListSort } from '@/types/prediction';

const breadcrumbLinkClass
  = 'font-medium text-interactive hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background';

type DiscoveryFeedLayoutProps = {
  /** Content above the title row (e.g. breadcrumbs). */
  headerPrefix?: ReactNode;
  title: ReactNode;
  emptyMessage: string;
  listSort: PredictionListSort;
  onListSortChange: (sort: PredictionListSort) => void;
  outcomeFilter: Outcome | 'all';
  onOutcomeFilter: (outcome: Outcome) => void;
  onClearOutcomeFilter: () => void;
  listData: Prediction[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  onRetry: () => void;
  onLoadMore: () => void;
  sidebar: ReactNode;
};

export function DiscoveryFeedLayout({
  headerPrefix,
  title,
  emptyMessage,
  listSort,
  onListSortChange,
  outcomeFilter,
  onOutcomeFilter,
  onClearOutcomeFilter,
  listData,
  loading,
  loadingMore,
  error,
  hasMore,
  onRetry,
  onLoadMore,
  sidebar,
}: DiscoveryFeedLayoutProps) {
  const [sortFiltersOpen, setSortFiltersOpen] = useState(false);
  const sortToggleRef = useRef<HTMLButtonElement>(null);
  const sortPanelRef = useRef<HTMLDivElement>(null);
  const sortFiltersWasOpen = useRef(sortFiltersOpen);

  useEffect(() => {
    if (sortFiltersWasOpen.current === sortFiltersOpen) return;
    sortFiltersWasOpen.current = sortFiltersOpen;

    if (sortFiltersOpen) {
      const firstRadio = sortPanelRef.current?.querySelector<HTMLInputElement>(
        'input[type="radio"]',
      );
      firstRadio?.focus();
      return;
    }

    sortToggleRef.current?.focus();
  }, [sortFiltersOpen]);

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="space-y-6 lg:col-span-8">
        <header className="space-y-2">
          {headerPrefix}
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">{title}</div>
            <div className="flex shrink-0 items-center gap-3">
              {loading && listData.length > 0
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
                aria-controls="discovery-prediction-sort-tabs"
                onClick={() => setSortFiltersOpen(open => !open)}
              >
                <Settings2 className="size-5" aria-hidden strokeWidth={1.75} />
                <span className="sr-only">
                  {sortFiltersOpen ? 'Hide sort options' : 'Show sort options'}
                </span>
              </button>
            </div>
          </div>
          <div
            ref={sortPanelRef}
            className={
              sortFiltersOpen
                ? 'animate-sort-filters-enter motion-reduce:animate-none'
                : 'hidden'
            }
            hidden={!sortFiltersOpen}
          >
            <PredictionSortTabs
              id="discovery-prediction-sort-tabs"
              value={listSort}
              onChange={onListSortChange}
              disabled={loading && listData.length === 0}
              hideLegend
            />
          </div>
          {outcomeFilter !== 'all'
            ? (
                <div
                  className="flex flex-wrap items-center gap-2"
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
                    className="inline-flex min-h-11 items-center rounded-full border border-border bg-surface-elevated px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    onClick={onClearOutcomeFilter}
                  >
                    Clear status filter
                  </button>
                </div>
              )
            : null}
        </header>

        {error
          ? (
              <div
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-error/35 bg-error/10 px-4 py-3 text-sm text-error"
                role="alert"
              >
                <span>{error}</span>
                <button
                  type="button"
                  className="rounded-lg bg-error px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
                  onClick={onRetry}
                >
                  Retry
                </button>
              </div>
            )
          : null}

        <PredictionFeedList
          predictions={listData}
          loading={loading}
          emptyMessage={emptyMessage}
          outcomeFilter={outcomeFilter}
          onOutcomeFilter={onOutcomeFilter}
        />

        {hasMore && listData.length > 0
          ? (
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  className="rounded-full border border-border bg-surface-elevated px-6 py-2.5 text-sm font-medium text-foreground shadow-sm hover:bg-surface disabled:opacity-50"
                  disabled={loadingMore}
                  onClick={onLoadMore}
                >
                  {loadingMore ? 'Loading…' : 'Load more'}
                </button>
              </div>
            )
          : null}
      </div>

      <div className="lg:col-span-4">{sidebar}</div>
    </div>
  );
}

export { breadcrumbLinkClass };
