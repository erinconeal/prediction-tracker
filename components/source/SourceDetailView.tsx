'use client';

import { useCallback, useMemo, useState } from 'react';
import { SourceDetailHeader } from '@/components/source/SourceDetailHeader';
import { SourceStatsSidebar } from '@/components/source/SourceStatsSidebar';
import { SourceTimelineSection } from '@/components/source/SourceTimelineSection';
import { usePredictionFeed } from '@/hooks/usePredictionFeed';
import { usePredictions } from '@/hooks/usePredictions';
import { humanizeSlug } from '@/lib/humanize-slug';
import {
  sourceFeedEmptyMessage,
  type SourceFeedStatusFilter,
} from '@/lib/source-feed-empty-message';
import { SOURCE_STATS_SNAPSHOT_LIMIT } from '@/lib/source-stats-snapshot';
import { computeSourceAccuracyStats } from '@/lib/source-stats';

const SOURCE_FEED_PAGE_SIZE = 20;

type SourceDetailViewProps = {
  sourceSlug: string;
};

export function SourceDetailView({ sourceSlug }: SourceDetailViewProps) {
  const [statusFilter, setStatusFilter] = useState<SourceFeedStatusFilter>('all');

  const statsFilters = useMemo(
    () => ({
      source: sourceSlug,
      status: 'all' as const,
      limit: SOURCE_STATS_SNAPSHOT_LIMIT,
    }),
    [sourceSlug],
  );

  const feedFilters = useMemo(
    () => ({
      source: sourceSlug,
      status: statusFilter === 'all' ? ('all' as const) : statusFilter,
    }),
    [sourceSlug, statusFilter],
  );

  const {
    data: statsData,
    loading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = usePredictions(statsFilters);

  const {
    data: feedData,
    loading: feedLoading,
    loadingMore: feedLoadingMore,
    error: feedError,
    hasMore: feedHasMore,
    refetch: refetchFeed,
    loadMore: loadMoreFeed,
  } = usePredictionFeed(feedFilters, { pageSize: SOURCE_FEED_PAGE_SIZE });

  const stats = useMemo(
    () =>
      computeSourceAccuracyStats(statsData, {
        nameFallback: humanizeSlug(sourceSlug),
      }),
    [statsData, sourceSlug],
  );

  const showHeaderSkeleton = statsLoading && statsData.length === 0;
  const statsSnapshotCapped = statsData.length >= SOURCE_STATS_SNAPSHOT_LIMIT;

  const timelinePredictions = useMemo(() => {
    if (feedError) return [];

    return [...feedData].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [feedData, feedError]);

  const emptyMessage = useMemo(
    () => sourceFeedEmptyMessage(statusFilter),
    [statusFilter],
  );

  const handleClearStatusFilter = useCallback(() => {
    setStatusFilter('all');
  }, []);

  const handleRetryFeed = useCallback(() => {
    void refetchFeed();
  }, [refetchFeed]);

  const handleLoadMoreFeed = useCallback(() => {
    void loadMoreFeed();
  }, [loadMoreFeed]);

  return (
    <div className="space-y-8">
      <SourceDetailHeader
        displayName={stats.name}
        accuracy={stats.accuracy}
        loading={showHeaderSkeleton}
      />

      {statsError
        ? (
            <div
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-error/35 bg-error/10 px-4 py-3 text-sm text-error"
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
            >
              <span>{statsError}</span>
              <button
                type="button"
                className="rounded-lg bg-error px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                onClick={() => void refetchStats()}
              >
                Retry
              </button>
            </div>
          )
        : null}

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="order-1 space-y-6 lg:order-2 lg:col-span-4">
          <div className="lg:sticky lg:top-8">
            <SourceStatsSidebar
              stats={stats}
              loading={showHeaderSkeleton}
              snapshotCapped={statsSnapshotCapped}
            />
          </div>
        </div>

        <div className="order-2 space-y-6 lg:order-1 lg:col-span-8">
          <SourceTimelineSection
            predictions={timelinePredictions}
            loading={feedLoading}
            loadingMore={feedLoadingMore}
            error={feedError}
            hasMore={feedHasMore}
            onRetry={handleRetryFeed}
            onLoadMore={handleLoadMoreFeed}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onClearStatusFilter={handleClearStatusFilter}
            emptyMessage={emptyMessage}
          />
        </div>
      </div>
    </div>
  );
}
