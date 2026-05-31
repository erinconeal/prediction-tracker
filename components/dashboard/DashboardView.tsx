'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BrowseForecastsSection } from '@/components/home/BrowseForecastsSection';
import { HomeHeroBand } from '@/components/home/HomeHeroBand';
import { HomeHeroCard } from '@/components/home/HomeHeroCard';
import { LeaderboardSection } from '@/components/home/LeaderboardSection';
import { TrendingTopicsStrip } from '@/components/home/TrendingTopicsStrip';
import type { TopicBucketTab } from '@/components/home/TopicBucketTabs';
import { usePredictionFeed } from '@/hooks/usePredictionFeed';
import { useTrendingTopics } from '@/hooks/useTrendingTopics';
import { browseEmptyMessage } from '@/lib/browse-empty-message';
import { pickPopularForecastsFromFeed } from '@/lib/popular-forecasts';
import { buildHomeBrowseHref } from '@/lib/home-topic-url';
import { useHomeTopicQuery } from '@/hooks/useHomeTopicQuery';
import { scrollBrowseForecastsIntoView } from '@/lib/scroll-to-browse';
import { listTopics } from '@/services/api';
import { rankTrendingTopics } from '@/lib/trending-topics';
import type { Topic } from '@/types/topic';
import { usePopularForecastSlotCount } from '@/hooks/usePopularForecastSlotCount';
import type { Outcome, PredictionListSort } from '@/types/prediction';

const PAGE_SIZE = 20;
const HOME_SAMPLE_SIZE = 50;

export function DashboardView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { topicTab, topicSlug, isFeedReady } = useHomeTopicQuery();
  const [listSort, setListSort] = useState<PredictionListSort>('newest');
  const [outcomeFilter, setOutcomeFilter] = useState<Outcome | 'all'>('all');

  const isDefaultFeed
    = topicTab === 'All' && listSort === 'newest' && outcomeFilter === 'all';

  const feedFilters = useMemo(
    () => ({
      status: outcomeFilter === 'all' ? ('all' as const) : outcomeFilter,
      ...(topicSlug !== undefined ? { topic: topicSlug } : {}),
      ...(listSort !== 'newest' ? { sort: listSort } : {}),
    }),
    [topicSlug, listSort, outcomeFilter],
  );

  const homeSample = usePredictionFeed(
    { status: 'all' },
    { pageSize: HOME_SAMPLE_SIZE, enabled: isFeedReady },
  );

  const filteredFeed = usePredictionFeed(feedFilters, {
    pageSize: PAGE_SIZE,
    enabled: isFeedReady && !isDefaultFeed,
  });

  const {
    data,
    loading,
    loadingMore,
    error,
    hasMore,
    refetch,
    loadMore,
  } = isDefaultFeed ? homeSample : filteredFeed;

  const trendingApi = useTrendingTopics({ limit: 6 });
  const [catalogTopics, setCatalogTopics] = useState<Topic[]>([]);

  useEffect(() => {
    if (!isFeedReady) return;
    if (trendingApi.data.length > 0 || trendingApi.loading) return;

    const controller = new AbortController();

    async function loadCatalogTopics() {
      try {
        const rows = await listTopics({ signal: controller.signal });
        if (!controller.signal.aborted) {
          setCatalogTopics(rows as Topic[]);
        }
      }
      catch {
        if (!controller.signal.aborted) setCatalogTopics([]);
      }
    }

    void loadCatalogTopics();

    return () => controller.abort();
  }, [isFeedReady, trendingApi.data.length, trendingApi.loading]);

  const trendingEntries = useMemo(() => {
    if (trendingApi.data.length > 0) {
      return trendingApi.data.map(t => ({
        topic: t,
        count: t.count,
        recentCount: t.recentCount,
      }));
    }
    if (catalogTopics.length === 0) return [];
    const curated = catalogTopics.filter(t => t.kind === 'curated');
    return rankTrendingTopics(curated, homeSample.data, { limit: 6 });
  }, [trendingApi.data, catalogTopics, homeSample.data]);

  const popularSlotCount = usePopularForecastSlotCount();

  const popularForecasts = useMemo(
    () =>
      pickPopularForecastsFromFeed(homeSample.data, {
        max: popularSlotCount,
      }),
    [homeSample.data, popularSlotCount],
  );

  const emptyMessage = browseEmptyMessage(topicTab, outcomeFilter);

  const syncTopicTabToUrl = useCallback(
    (tab: TopicBucketTab) => {
      router.replace(
        buildHomeBrowseHref(pathname, tab, searchParams),
        { scroll: false },
      );
    },
    [pathname, router, searchParams],
  );

  const handleTopicTabChange = useCallback(
    (tab: TopicBucketTab) => {
      setOutcomeFilter('all');
      syncTopicTabToUrl(tab);
      scrollBrowseForecastsIntoView();
    },
    [syncTopicTabToUrl],
  );

  const handleOutcomeFilter = useCallback((outcome: Outcome) => {
    setOutcomeFilter(prev => (prev === outcome ? 'all' : outcome));
    scrollBrowseForecastsIntoView();
  }, []);

  const clearOutcomeFilter = useCallback(() => {
    setOutcomeFilter('all');
    scrollBrowseForecastsIntoView();
  }, []);

  const trendingTopicsHeader = (
    <TrendingTopicsStrip
      topics={trendingEntries}
      loading={homeSample.loading && trendingEntries.length === 0}
      embedded
    />
  );

  return (
    <div className="-mt-4 space-y-12 pb-4">
      <h1 className="sr-only">Prediction Tracker</h1>
      <HomeHeroBand>
        <HomeHeroCard
          header={trendingTopicsHeader}
          popularForecasts={popularForecasts}
          statsContext={homeSample.data}
          loading={homeSample.loading}
          slotCount={popularSlotCount}
        />
      </HomeHeroBand>

      <BrowseForecastsSection
        topicTab={topicTab}
        onTopicTabChange={handleTopicTabChange}
        listSort={listSort}
        onListSortChange={setListSort}
        outcomeFilter={outcomeFilter}
        onOutcomeFilter={handleOutcomeFilter}
        onClearOutcomeFilter={clearOutcomeFilter}
        predictions={data}
        loading={loading}
        loadingMore={loadingMore}
        error={error}
        hasMore={hasMore}
        emptyMessage={emptyMessage}
        onRetry={refetch}
        onLoadMore={loadMore}
      />

      <LeaderboardSection limit={10} />
    </div>
  );
}
