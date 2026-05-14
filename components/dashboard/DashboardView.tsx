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
import { FeaturedPredictionCarousel } from "@/components/home/FeaturedPredictionCarousel";
import { HomeLayout } from "@/components/home/HomeLayout";
import { InsightCallout } from "@/components/home/InsightCallout";
import { TopPerformersPanel } from "@/components/home/TopPerformersPanel";
import { PredictionGrid } from "@/components/predictions/PredictionGrid";
import { usePredictionFeed } from "@/hooks/usePredictionFeed";
import { useTopInsight } from "@/hooks/useTopInsight";
import type { PredictionListSort } from "@/types/prediction";
import {
  DEFAULT_MAX_FEATURED_SLIDES,
  pickFeaturedFromFeed,
} from "@/lib/featured-feed";

const PAGE_SIZE = 20;

export function DashboardView() {
  const [topic, setTopic] = useState<TopicTab>("All");
  const [listSort, setListSort] = useState<PredictionListSort>("newest");
  const category = useMemo(() => categoryFromTopicTab(topic), [topic]);

  const feedFilters = useMemo(
    () => ({
      status: "all" as const,
      ...(category !== undefined ? { category } : {}),
      ...(listSort !== "newest" ? { sort: listSort } : {}),
    }),
    [category, listSort],
  );

  const {
    data,
    loading,
    loadingMore,
    error,
    hasMore,
    refetch,
    loadMore,
  } = usePredictionFeed(feedFilters, { pageSize: PAGE_SIZE });

  const { insight, loading: insightLoading } = useTopInsight();

  const { slides: featuredSlides, spotlightTitle } = useMemo(
    () => pickFeaturedFromFeed(data, DEFAULT_MAX_FEATURED_SLIDES),
    [data],
  );

  const emptyMessage =
    topic === "All"
      ? "No predictions match these filters."
      : `No predictions in “${topic}” yet.`;

  const handleTopicChange = useCallback((tab: TopicTab) => {
    setTopic(tab);
  }, []);

  return (
    <HomeLayout
      hero={
        <FeaturedPredictionCarousel
          predictions={featuredSlides}
          spotlightTitle={spotlightTitle}
          statsContextPredictions={data}
        />
      }
      main={
        <div className="space-y-10">
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

          <InsightCallout insight={insight} loading={insightLoading} />

          <section className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-serif text-xl font-normal tracking-tight text-foreground">
                  All predictions
                </h2>
                <p className="mt-1 text-sm text-muted">
                  {sortSubtitle(listSort)}
                </p>
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

            <CategoryTopicTabs
              active={topic}
              onChange={handleTopicChange}
              disabled={loading && data.length === 0}
            />

            <PredictionSortTabs
              value={listSort}
              onChange={setListSort}
              disabled={loading && data.length === 0}
            />

            <PredictionGrid
              predictions={data}
              loading={loading}
              emptyMessage={emptyMessage}
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
        </div>
      }
      aside={<TopPerformersPanel limit={10} />}
    />
  );
}
