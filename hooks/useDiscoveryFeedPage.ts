'use client';

import { useCallback, useMemo, useState } from 'react';
import { usePredictionFeed } from '@/hooks/usePredictionFeed';
import { computeFeedPlatformStats } from '@/lib/feed-platform-stats';
import { pickRecentResolutions } from '@/lib/recent-resolutions';
import type { FeedPlatformStats } from '@/lib/feed-platform-stats';
import type { RecentResolution } from '@/lib/recent-resolutions';
import type { Outcome, Prediction, PredictionListSort } from '@/types/prediction';

const LIST_PAGE_SIZE = 20;
/** Single scoped fetch size for list pagination and sidebar widgets. */
const SCOPE_BATCH_SIZE = 80;

export type DiscoveryFeedScope = { topicSlug: string };

type UseDiscoveryFeedPageResult = {
  listSort: PredictionListSort;
  setListSort: (sort: PredictionListSort) => void;
  outcomeFilter: Outcome | 'all';
  setOutcomeFilter: (outcome: Outcome | 'all') => void;
  handleOutcomeFilter: (outcome: Outcome) => void;
  clearOutcomeFilter: () => void;
  listData: Prediction[];
  scopeData: Prediction[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  recentResolutions: RecentResolution[];
  platformStats: FeedPlatformStats;
};

export function useDiscoveryFeedPage(
  scope: DiscoveryFeedScope,
): UseDiscoveryFeedPageResult {
  const [listSort, setListSort] = useState<PredictionListSort>('newest');
  const [outcomeFilter, setOutcomeFilter] = useState<Outcome | 'all'>('all');
  const [visibleCount, setVisibleCount] = useState(LIST_PAGE_SIZE);

  const scopeFilters = useMemo(() => {
    const base = { topic: scope.topicSlug, status: 'all' as const };
    return listSort !== 'newest' ? { ...base, sort: listSort } : base;
  }, [scope, listSort]);

  const {
    data: scopeData,
    loading,
    loadingMore,
    error,
    hasMore: feedHasMore,
    refetch,
    loadMore: feedLoadMore,
  } = usePredictionFeed(scopeFilters, { pageSize: SCOPE_BATCH_SIZE });

  const filteredData = useMemo(() => {
    if (outcomeFilter === 'all') return scopeData;
    return scopeData.filter(p => p.outcome === outcomeFilter);
  }, [scopeData, outcomeFilter]);

  const listData = useMemo(
    () => filteredData.slice(0, visibleCount),
    [filteredData, visibleCount],
  );

  const hasMore
    = visibleCount < filteredData.length || feedHasMore;

  const loadMore = useCallback(async () => {
    if (visibleCount < filteredData.length) {
      setVisibleCount(count =>
        Math.min(count + LIST_PAGE_SIZE, filteredData.length),
      );
      return;
    }
    await feedLoadMore();
    setVisibleCount(count => count + LIST_PAGE_SIZE);
  }, [visibleCount, filteredData.length, feedLoadMore]);

  const handleOutcomeFilter = useCallback((outcome: Outcome) => {
    setOutcomeFilter(prev => (prev === outcome ? 'all' : outcome));
    setVisibleCount(LIST_PAGE_SIZE);
  }, []);

  const clearOutcomeFilter = useCallback(() => {
    setOutcomeFilter('all');
    setVisibleCount(LIST_PAGE_SIZE);
  }, []);

  const recentResolutions = useMemo(
    () => pickRecentResolutions(scopeData, 5),
    [scopeData],
  );

  const platformStats = useMemo(
    () => computeFeedPlatformStats(scopeData),
    [scopeData],
  );

  const setListSortWithReset = useCallback((sort: PredictionListSort) => {
    setListSort(sort);
    setVisibleCount(LIST_PAGE_SIZE);
  }, []);

  return {
    listSort,
    setListSort: setListSortWithReset,
    outcomeFilter,
    setOutcomeFilter,
    handleOutcomeFilter,
    clearOutcomeFilter,
    listData,
    scopeData,
    loading,
    loadingMore,
    error,
    hasMore,
    refetch,
    loadMore,
    recentResolutions,
    platformStats,
  };
}
