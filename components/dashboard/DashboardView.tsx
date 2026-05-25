'use client';

import { Settings2 } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  PredictionSortTabs,
  sortOptionLabel,
} from '@/components/dashboard/PredictionSortTabs';
import {
  CategoryTabs,
  categoryFromCategoryTab,
  type CategoryTab,
} from '@/components/home/CategoryTabs';
import { HomeHeroBand } from '@/components/home/HomeHeroBand';
import { HomeHeroCard } from '@/components/home/HomeHeroCard';
import { LeaderboardSection } from '@/components/home/LeaderboardSection';
import { TrendingTopicsStrip } from '@/components/home/TrendingTopicsStrip';
import { PredictionGrid } from '@/components/predictions/PredictionGrid';
import { usePredictionFeed } from '@/hooks/usePredictionFeed';
import { useTrendingTopics } from '@/hooks/useTrendingTopics';
import { browseEmptyMessage } from '@/lib/browse-empty-message';
import { pickPopularForecastsFromFeed } from '@/lib/popular-forecasts';
import {
  buildHomeBrowseHref,
  categoryTabFromSearchParam,
} from '@/lib/home-category-url';
import { scrollBrowseForecastsIntoView } from '@/lib/scroll-to-browse';
import { listTopics } from '@/services/api';
import { rankTrendingTopics } from '@/lib/trending-topics';
import type { Topic } from '@/types/topic';
import { useFeaturedForecastSlotCount } from '@/hooks/useFeaturedForecastSlotCount';
import { outcomeLabels } from '@/components/predictions/outcome-display';
import type { Outcome, PredictionListSort } from '@/types/prediction';

const PAGE_SIZE = 20;
const HOME_SAMPLE_SIZE = 50;

export function DashboardView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [categoryTab, setCategoryTab] = useState<CategoryTab>(() =>
    categoryTabFromSearchParam(searchParams.get('category')) ?? 'All',
  );
  const [listSort, setListSort] = useState<PredictionListSort>('newest');
  const [outcomeFilter, setOutcomeFilter] = useState<Outcome | 'all'>('all');
  const [sortFiltersOpen, setSortFiltersOpen] = useState(false);
  const sortToggleRef = useRef<HTMLButtonElement>(null);
  const sortPanelRef = useRef<HTMLDivElement>(null);
  const sortFiltersWasOpen = useRef(sortFiltersOpen);
  const category = useMemo(
    () => categoryFromCategoryTab(categoryTab),
    [categoryTab],
  );

  const isDefaultFeed
    = categoryTab === 'All' && listSort === 'newest' && outcomeFilter === 'all';

  const feedFilters = useMemo(
    () => ({
      status: outcomeFilter === 'all' ? ('all' as const) : outcomeFilter,
      ...(category !== undefined ? { category } : {}),
      ...(listSort !== 'newest' ? { sort: listSort } : {}),
    }),
    [category, listSort, outcomeFilter],
  );

  const homeSample = usePredictionFeed(
    { status: 'all' },
    { pageSize: HOME_SAMPLE_SIZE },
  );

  const filteredFeed = usePredictionFeed(feedFilters, {
    pageSize: PAGE_SIZE,
    enabled: !isDefaultFeed,
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
    if (trendingApi.data.length > 0 || trendingApi.loading) return;

    const controller = new AbortController();
    void listTopics({ signal: controller.signal })
      .then((rows) => {
        if (!controller.signal.aborted) {
          setCatalogTopics(rows as Topic[]);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setCatalogTopics([]);
      });

    return () => controller.abort();
  }, [trendingApi.data.length, trendingApi.loading]);

  const trendingEntries = useMemo(() => {
    if (trendingApi.data.length > 0) {
      return trendingApi.data.map(t => ({
        topic: t,
        count: t.count,
        recentCount: t.recentCount,
      }));
    }
    if (catalogTopics.length === 0) return [];
    return rankTrendingTopics(catalogTopics, homeSample.data, { limit: 6 });
  }, [trendingApi.data, catalogTopics, homeSample.data]);

  const featuredSlotCount = useFeaturedForecastSlotCount();

  const popularForecasts = useMemo(
    () =>
      pickPopularForecastsFromFeed(homeSample.data, {
        max: featuredSlotCount,
      }),
    [homeSample.data, featuredSlotCount],
  );

  const emptyMessage = browseEmptyMessage(categoryTab, outcomeFilter);

  const syncCategoryToUrl = useCallback(
    (tab: CategoryTab) => {
      router.replace(
        buildHomeBrowseHref(pathname, tab, searchParams),
        { scroll: false },
      );
    },
    [pathname, router, searchParams],
  );

  const handleCategoryTabChange = useCallback(
    (tab: CategoryTab) => {
      setCategoryTab(tab);
      setOutcomeFilter('all');
      syncCategoryToUrl(tab);
      scrollBrowseForecastsIntoView();
    },
    [syncCategoryToUrl],
  );

  const handleOutcomeFilter = useCallback((outcome: Outcome) => {
    setOutcomeFilter(prev => (prev === outcome ? 'all' : outcome));
    scrollBrowseForecastsIntoView();
  }, []);

  const clearOutcomeFilter = useCallback(() => {
    setOutcomeFilter('all');
    scrollBrowseForecastsIntoView();
  }, []);

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
            <div className="flex shrink-0 items-center gap-3">
              {loading && data.length > 0
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
                aria-controls="prediction-sort-tabs"
                onClick={() => setSortFiltersOpen(open => !open)}
              >
                <Settings2 className="size-5" aria-hidden strokeWidth={1.75} />
                <span className="sr-only">
                  {sortFiltersOpen ? 'Hide sort options' : 'Show sort options'}
                </span>
              </button>
            </div>
          </div>
          {outcomeFilter !== 'all'
            ? (
                <div className="mt-3 flex flex-wrap items-center gap-2">
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
                    onClick={clearOutcomeFilter}
                  >
                    Clear status filter
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

        <CategoryTabs
          active={categoryTab}
          onChange={handleCategoryTabChange}
          disabled={loading && data.length === 0}
          showLegend={false}
        />

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
            id="prediction-sort-tabs"
            value={listSort}
            onChange={setListSort}
            disabled={loading && data.length === 0}
            hideLegend
          />
        </div>

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
