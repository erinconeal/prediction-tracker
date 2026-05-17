"use client";

import { useCallback, useMemo, useState } from "react";
import {
  PredictionSortTabs,
  sortSubtitle,
} from "@/components/dashboard/PredictionSortTabs";
import {
  CategoryTopicTabs,
  categoryFromTopicTab,
  type TopicTab,
} from "@/components/home/CategoryTopicTabs";
import { HomeHeroBand } from "@/components/home/HomeHeroBand";
import { HomeHeroCard } from "@/components/home/HomeHeroCard";
import { LeaderboardSection } from "@/components/home/LeaderboardSection";
import { TrendingTopicsStrip } from "@/components/home/TrendingTopicsStrip";
import { PredictionGrid } from "@/components/predictions/PredictionGrid";
import { usePredictionFeed } from "@/hooks/usePredictionFeed";
import { browseEmptyMessage } from "@/lib/browse-empty-message";
import { pickPopularForecastsFromFeed } from "@/lib/popular-forecasts";
import { scrollBrowseForecastsIntoView } from "@/lib/scroll-to-browse";
import { rankTrendingTopics } from "@/lib/trending-topics";
import { useFeaturedForecastSlotCount } from "@/hooks/useFeaturedForecastSlotCount";
import { outcomeLabels } from "@/components/predictions/outcome-display";
import type { Outcome, PredictionListSort } from "@/types/prediction";

const PAGE_SIZE = 20;
/** Unfiltered sample for hero, trending, and popular cards (also first page when filters are default). */
const HOME_SAMPLE_SIZE = 50;

export function DashboardView() {
  const [topic, setTopic] = useState<TopicTab>("All");
  const [listSort, setListSort] = useState<PredictionListSort>("newest");
  const [outcomeFilter, setOutcomeFilter] = useState<Outcome | "all">("all");
  const category = useMemo(() => categoryFromTopicTab(topic), [topic]);

  const isDefaultFeed =
    topic === "All" && listSort === "newest" && outcomeFilter === "all";

  const feedFilters = useMemo(
    () => ({
      status: outcomeFilter === "all" ? ("all" as const) : outcomeFilter,
      ...(category !== undefined ? { category } : {}),
      ...(listSort !== "newest" ? { sort: listSort } : {}),
    }),
    [category, listSort, outcomeFilter],
  );

  const homeSample = usePredictionFeed(
    { status: "all" },
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

  const trendingTopics = useMemo(
    () => rankTrendingTopics(homeSample.data),
    [homeSample.data],
  );

  const featuredSlotCount = useFeaturedForecastSlotCount();

  const popularForecasts = useMemo(
    () =>
      pickPopularForecastsFromFeed(homeSample.data, {
        max: featuredSlotCount,
      }),
    [homeSample.data, featuredSlotCount],
  );

  const emptyMessage = browseEmptyMessage(topic, outcomeFilter);

  const handleTopicChange = useCallback((tab: TopicTab) => {
    setTopic(tab);
    setOutcomeFilter("all");
  }, []);

  const handleCategorySelect = useCallback((tab: TopicTab) => {
    setTopic(tab);
    setOutcomeFilter("all");
    scrollBrowseForecastsIntoView();
  }, []);

  const handleOutcomeFilter = useCallback((outcome: Outcome) => {
    setOutcomeFilter((prev) => (prev === outcome ? "all" : outcome));
    scrollBrowseForecastsIntoView();
  }, []);

  const clearOutcomeFilter = useCallback(() => {
    setOutcomeFilter("all");
    scrollBrowseForecastsIntoView();
  }, []);

  const showCategoryTabs =
    !homeSample.loading && trendingTopics.length === 0;

  const trendingTopicsHeader = (
    <TrendingTopicsStrip
      topics={trendingTopics}
      active={topic}
      onSelect={handleTopicChange}
      loading={homeSample.loading && trendingTopics.length === 0}
      embedded
      showAllTopic
    />
  );

  return (
    <div className="-mt-4 space-y-16 pb-4">
      <h1 className="sr-only">Prediction Tracker</h1>
      <HomeHeroBand>
        <HomeHeroCard
          header={trendingTopicsHeader}
          popularForecasts={popularForecasts}
          statsContext={homeSample.data}
          loading={homeSample.loading}
          slotCount={featuredSlotCount}
          onCategorySelect={handleCategorySelect}
        />
      </HomeHeroBand>

      <section className="space-y-6" aria-labelledby="forecasts-heading">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="forecasts-heading"
              className="font-serif text-2xl font-normal tracking-tight text-foreground sm:text-3xl"
            >
              Browse forecasts
            </h2>
            <p className="mt-2 text-sm text-muted">{sortSubtitle(listSort)}</p>
            {outcomeFilter !== "all" ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted">
                  Showing:{" "}
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
            ) : null}
          </div>
          {loading && data.length > 0 ? (
            <span
              className="text-xs text-muted"
              role="status"
              aria-live="polite"
            >
              Updating…
            </span>
          ) : null}
        </div>

        {error ? (
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
        ) : null}

        {showCategoryTabs ? (
          <CategoryTopicTabs
            active={topic}
            onChange={handleTopicChange}
            disabled={loading && data.length === 0}
            showLegend={false}
          />
        ) : null}

        <PredictionSortTabs
          value={listSort}
          onChange={setListSort}
          disabled={loading && data.length === 0}
        />

        <PredictionGrid
          predictions={data}
          loading={loading}
          emptyMessage={emptyMessage}
          outcomeFilter={outcomeFilter}
          onOutcomeFilter={handleOutcomeFilter}
          onCategorySelect={handleCategorySelect}
        />

        {hasMore && data.length > 0 ? (
          <div className="flex justify-center pt-2">
            <button
              type="button"
              className="rounded-full border border-border bg-surface-elevated px-6 py-2.5 text-sm font-medium text-foreground shadow-sm hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50"
              disabled={loadingMore}
              onClick={() => void loadMore()}
            >
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          </div>
        ) : null}
      </section>

      <LeaderboardSection limit={10} />
    </div>
  );
}
