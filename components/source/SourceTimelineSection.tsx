'use client';

import { outcomeLabels } from '@/components/predictions/outcome-display';
import { SourceFeedStatusFilterControl } from '@/components/source/SourceFeedStatusFilterControl';
import { SourceTimelineList } from '@/components/source/SourceTimelineList';
import type { SourceFeedStatusFilter } from '@/lib/source-feed-empty-message';
import type { Prediction } from '@/types/prediction';

const SOURCE_FEED_STATUS_FILTER_ID = 'source-feed-status-filter';

type SourceTimelineSectionProps = {
  predictions: Prediction[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  onRetry: () => void;
  onLoadMore: () => void;
  statusFilter: SourceFeedStatusFilter;
  onStatusFilterChange: (filter: SourceFeedStatusFilter) => void;
  onClearStatusFilter: () => void;
  emptyMessage: string;
};

export function SourceTimelineSection({
  predictions,
  loading,
  loadingMore,
  error,
  hasMore,
  onRetry,
  onLoadMore,
  statusFilter,
  onStatusFilterChange,
  onClearStatusFilter,
  emptyMessage,
}: SourceTimelineSectionProps) {
  return (
    <section aria-labelledby="source-prediction-feed-heading" className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2
          id="source-prediction-feed-heading"
          className="font-serif text-2xl font-normal tracking-tight text-foreground"
        >
          Prediction feed
        </h2>
        <SourceFeedStatusFilterControl
          id={SOURCE_FEED_STATUS_FILTER_ID}
          value={statusFilter}
          onChange={onStatusFilterChange}
          disabled={loading && predictions.length === 0}
        />
      </div>

      {statusFilter !== 'all'
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
                  {outcomeLabels[statusFilter]}
                </span>
              </span>
              <button
                type="button"
                className="inline-flex min-h-11 items-center rounded-full border border-border bg-surface-elevated px-3 py-1.5 text-sm font-medium text-foreground hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                onClick={onClearStatusFilter}
              >
                Clear status filter
              </button>
            </div>
          )
        : null}

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
                onClick={() => void onRetry()}
              >
                Retry
              </button>
            </div>
          )
        : null}

      <SourceTimelineList
        predictions={predictions}
        loading={loading}
        emptyMessage={emptyMessage}
      />

      {hasMore && predictions.length > 0
        ? (
            <div className="flex justify-center pt-2">
              <button
                type="button"
                className="rounded-full border border-border bg-surface-elevated px-6 py-2.5 text-sm font-medium text-foreground shadow-sm hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50"
                disabled={loadingMore}
                aria-busy={loadingMore}
                onClick={() => void onLoadMore()}
              >
                {loadingMore ? 'Loading…' : 'Load more'}
              </button>
            </div>
          )
        : null}
    </section>
  );
}
