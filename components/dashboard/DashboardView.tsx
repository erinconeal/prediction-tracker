"use client";

import { useCallback, useMemo, useState } from "react";
import {
  CategoryTopicTabs,
  categoryFromTopicTab,
  type TopicTab,
} from "@/components/home/CategoryTopicTabs";
import { FeaturedPredictionCarousel } from "@/components/home/FeaturedPredictionCarousel";
import { HomeLayout } from "@/components/home/HomeLayout";
import { TopPerformersPanel } from "@/components/home/TopPerformersPanel";
import { PredictionGrid } from "@/components/predictions/PredictionGrid";
import { usePredictionFeed } from "@/hooks/usePredictionFeed";
import {
  DEFAULT_MAX_FEATURED_SLIDES,
  pickFeaturedFromFeed,
} from "@/lib/featured-feed";

const PAGE_SIZE = 20;

export function DashboardView() {
  const [topic, setTopic] = useState<TopicTab>("All");
  const category = useMemo(() => categoryFromTopicTab(topic), [topic]);

  const feedFilters = useMemo(
    () => ({
      status: "all" as const,
      ...(category !== undefined ? { category } : {}),
    }),
    [category],
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
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-800 dark:bg-red-950/60 dark:text-red-100"
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
            >
              <span>{error}</span>
              <button
                type="button"
                className="rounded-lg bg-red-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-red-50 dark:bg-red-200 dark:text-red-950 dark:hover:bg-white dark:focus-visible:ring-red-700 dark:focus-visible:ring-offset-red-950"
                onClick={() => void refetch()}
              >
                Retry
              </button>
            </div>
          ) : null}

          <section className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                  All predictions
                </h2>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Newest first. Open a card for timeline and source stats.
                </p>
              </div>
              {loading && data.length > 0 ? (
                <span
                  className="text-xs text-zinc-600 dark:text-zinc-300"
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

            <PredictionGrid
              predictions={data}
              loading={loading}
              emptyMessage={emptyMessage}
            />

            {hasMore && data.length > 0 ? (
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  className="rounded-full border border-zinc-200 bg-white px-6 py-2.5 text-sm font-medium text-zinc-900 shadow-sm hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:focus-visible:ring-offset-zinc-950"
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
