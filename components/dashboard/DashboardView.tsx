'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  PredictionSortFilterPanel,
  PredictionSortFilterToolbar,
} from '@/components/predictions/PredictionSortFilterControls';
import {
  TopicBucketTabs,
  type TopicBucketTab,
} from '@/components/home/TopicBucketTabs';
import { HomeHeroBand } from '@/components/home/HomeHeroBand';
import { HomeHeroCard } from '@/components/home/HomeHeroCard';
import { LeaderboardSection } from '@/components/home/LeaderboardSection';
import { TrendingTopicsStrip } from '@/components/home/TrendingTopicsStrip';
import { PredictionGrid } from '@/components/predictions/PredictionGrid';
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
import { useCollapsibleSortFilters } from '@/hooks/useCollapsibleSortFilters';
import { useFeaturedForecastSlotCount } from '@/hooks/useFeaturedForecastSlotCount';
import { outcomeLabels } from '@/components/predictions/outcome-display';
import type { Outcome, PredictionListSort } from '@/types/prediction';

const PAGE_SIZE = 20;
const HOME_SAMPLE_SIZE = 50;
const HOME_SORT_CONTROLS_ID = 'prediction-sort-tabs';

export function DashboardView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { topicTab, topicSlug, isFeedReady } = useHomeTopicQuery();
  const [listSort, setListSort] = useState<PredictionListSort>('newest');
  const [outcomeFilter, setOutcomeFilter] = useState<Outcome | 'all'>('all');
  const {
    sortFiltersOpen,
    toggleSortFilters,
    sortToggleRef,
    sortPanelRef,
  } = useCollapsibleSortFilters();

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

  const featuredSlotCount = useFeaturedForecastSlotCount();

  const popularForecasts = useMemo(
    () =>
      pickPopularForecastsFromFeed(homeSample.data, {
        max: featuredSlotCount,
      }),
    [homeSample.data, featuredSlotCount],
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
          slotCount={featuredSlotCount}
        />
      </HomeHeroBand>

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
              controlsId={HOME_SORT_CONTROLS_ID}
              listSort={listSort}
              loading={loading}
              hasLoadedRows={data.length > 0}
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
                    onClick={clearOutcomeFilter}
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
                  onClick={() => void refetch()}
                >
                  Retry
                </button>
              </div>
            )
          : null}

        <TopicBucketTabs
          active={topicTab}
          onChange={handleTopicTabChange}
          disabled={loading && data.length === 0}
          showLegend={false}
        />

        <PredictionSortFilterPanel
          id={HOME_SORT_CONTROLS_ID}
          listSort={listSort}
          onChange={setListSort}
          disabled={loading && data.length === 0}
          sortFiltersOpen={sortFiltersOpen}
          sortPanelRef={sortPanelRef}
        />

        <PredictionGrid
          predictions={data}
          loading={loading}
          emptyMessage={emptyMessage}
          outcomeFilter={outcomeFilter}
          onOutcomeFilter={handleOutcomeFilter}
        />

        {hasMore && data.length > 0
          ? (
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  className="rounded-full border border-border bg-surface-elevated px-6 py-2.5 text-sm font-medium text-foreground shadow-sm hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50"
                  disabled={loadingMore}
                  onClick={() => void loadMore()}
                >
                  {loadingMore ? 'Loading…' : 'Load more'}
                </button>
              </div>
            )
          : null}
      </section>

      <LeaderboardSection limit={10} />
    </div>
  );
}
