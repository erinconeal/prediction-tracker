"use client";

import { memo, useCallback, useEffect, useId, useMemo, useState } from "react";
import Link from "next/link";
import { OutcomeBadge } from "@/components/predictions/OutcomeBadge";
import { DEFAULT_MAX_FEATURED_SLIDES } from "@/lib/featured-feed";
import {
  computeSourceAccuracyStats,
  type SourceAccuracyStats,
} from "@/lib/source-stats";
import { formatIsoDate } from "@/utils/format-date";
import type { Prediction } from "@/types/prediction";

function credibilityAccuracyPhrase(stats: SourceAccuracyStats): string {
  const n = stats.total;
  const noun = n === 1 ? "prediction" : "predictions";
  if (stats.accuracy === null) {
    return `— (${n} ${noun}, none resolved)`;
  }
  return `${stats.accuracy}% accuracy (${n} ${noun})`;
}

type FeaturedPredictionCarouselProps = {
  predictions: Prediction[];
  /** Eyebrow framing why the carousel matters (e.g. week vs highlights). */
  spotlightTitle: string;
  /** Loaded feed (or broader list) used to compute per-source accuracy counts. */
  statsContextPredictions?: Prediction[];
  className?: string;
};

export const FeaturedPredictionCarousel = memo(
  function FeaturedPredictionCarousel({
    predictions,
    spotlightTitle,
    statsContextPredictions,
    className = "",
  }: FeaturedPredictionCarouselProps) {
    const baseId = useId();
    const slides = predictions.slice(0, DEFAULT_MAX_FEATURED_SLIDES);
    const [index, setIndex] = useState(0);

    useEffect(() => {
      setIndex((i) => (slides.length === 0 ? 0 : Math.min(i, slides.length - 1)));
    }, [slides.length]);

    const go = useCallback(
      (delta: number) => {
        if (slides.length === 0) return;
        setIndex((i) => (i + delta + slides.length) % slides.length);
      },
      [slides.length],
    );

    const safeIndex =
      slides.length === 0 ? 0 : Math.min(index, slides.length - 1);
    const current = slides[safeIndex];

    const statsContext = statsContextPredictions ?? predictions;
    const sourceStats = useMemo(() => {
      if (current === undefined) {
        return computeSourceAccuracyStats([], { nameFallback: "" });
      }
      return computeSourceAccuracyStats(
        statsContext.filter((p) => p.sourceSlug === current.sourceSlug),
        {
          nameFallback: current.sourceSlug,
          primaryName: current.source,
        },
      );
    }, [
      statsContext,
      current?.id,
      current?.sourceSlug,
      current?.source,
    ]);

    const accuracyPhrase = credibilityAccuracyPhrase(sourceStats);

    if (current === undefined) {
      return null;
    }

    return (
      <section
        className={`relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50/80 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60 ${className}`.trim()}
        aria-roledescription="carousel"
        aria-label={`${spotlightTitle}. Featured predictions.`}
      >
        <div className="flex min-h-[200px] flex-1 flex-col justify-between gap-6 p-6 sm:p-8 sm:pr-28">
          <div className="min-w-0 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
              {spotlightTitle}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500 dark:text-zinc-500">
              {current.category ? (
                <span className="rounded-full bg-zinc-100/90 px-2.5 py-0.5 font-normal text-zinc-600 ring-1 ring-zinc-200/80 dark:bg-zinc-950/80 dark:text-zinc-500 dark:ring-zinc-700/80">
                  {current.category}
                </span>
              ) : null}
              <span className="tabular-nums">
                Added {formatIsoDate(current.created_at)}
              </span>
            </div>
            <p className="text-lg font-semibold leading-snug tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-xl">
              <Link
                href={`/predictions/${encodeURIComponent(current.id)}`}
                className="hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 dark:hover:text-blue-300 dark:focus-visible:ring-offset-zinc-900"
              >
                {current.text}
              </Link>
            </p>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-zinc-600 dark:text-zinc-400">
              <OutcomeBadge outcome={current.outcome} className="text-sm" />
              <span aria-hidden className="text-zinc-400 dark:text-zinc-600">
                ·
              </span>
              <Link
                href={`/source/${encodeURIComponent(current.sourceSlug)}`}
                className="font-normal text-zinc-700 underline-offset-2 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                {current.source}
              </Link>
              <span aria-hidden className="text-zinc-400 dark:text-zinc-600">
                ·
              </span>
              <span className="min-w-0 text-zinc-500 dark:text-zinc-500">
                {accuracyPhrase}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap justify-end gap-4">
            <Link
              href={`/predictions/${encodeURIComponent(current.id)}`}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 dark:focus-visible:ring-offset-zinc-900"
            >
              View details
            </Link>
          </div>
        </div>

        {slides.length > 1 ? (
          <>
            <div
              className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 sm:left-auto sm:right-6 sm:translate-x-0"
              role="tablist"
              aria-label="Slide"
            >
              {slides.map((p, i) => {
                const tabId = `${baseId}-tab-${i}`;
                const panelId = `${baseId}-panel-${i}`;
                return (
                  <button
                    key={p.id}
                    id={tabId}
                    type="button"
                    role="tab"
                    aria-selected={i === safeIndex}
                    aria-controls={panelId}
                    className={`h-2 w-2 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${
                      i === index
                        ? "bg-blue-600"
                        : "bg-zinc-300 hover:bg-zinc-400 dark:bg-zinc-600 dark:hover:bg-zinc-500"
                    }`}
                    onClick={() => setIndex(i)}
                    aria-label={`Show prediction ${i + 1} of ${slides.length}`}
                  />
                );
              })}
            </div>
            <button
              type="button"
              aria-label="Previous slide"
              className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full border border-zinc-200 bg-white/90 p-2 text-zinc-800 shadow-sm hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:flex dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-100"
              onClick={() => go(-1)}
            >
              <span aria-hidden className="text-lg leading-none">
                ‹
              </span>
            </button>
            <button
              type="button"
              aria-label="Next slide"
              className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full border border-zinc-200 bg-white/90 p-2 text-zinc-800 shadow-sm hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:flex dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-100"
              onClick={() => go(1)}
            >
              <span aria-hidden className="text-lg leading-none">
                ›
              </span>
            </button>
          </>
        ) : null}

        <div
          id={`${baseId}-panel-${safeIndex}`}
          role="tabpanel"
          aria-live="polite"
          className="sr-only"
        >
          {current.text}. {current.outcome}. {current.source}. {accuracyPhrase}
        </div>
      </section>
    );
  },
);
