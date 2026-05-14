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
    if (stats.scored === 0 && stats.resolved > 0) {
      return `— (${n} ${noun}, none with correct/incorrect outcome yet)`;
    }
    return `— (${n} ${noun}, none scored for accuracy)`;
  }
  return `${stats.accuracy}% accuracy (${n} ${noun}, ${stats.scored} scored)`;
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
    }, [statsContext, current]);

    const accuracyPhrase = credibilityAccuracyPhrase(sourceStats);

    if (current === undefined) {
      return null;
    }

    const hasSlideControls = slides.length > 1;

    return (
      <section
        className={`relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm ${className}`.trim()}
        aria-roledescription="carousel"
        aria-label={`${spotlightTitle}. Featured predictions.`}
      >
        <div
          className={
            hasSlideControls
              ? "flex min-h-[200px] flex-1 flex-col justify-between gap-6 px-6 pt-6 pb-20 sm:px-8 sm:pt-8 sm:pr-28 sm:pb-24"
              : "flex min-h-[200px] flex-1 flex-col justify-between gap-6 p-6 sm:p-8 sm:pr-28"
          }
        >
          <div className="min-w-0 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-interactive">
              {spotlightTitle}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
              {current.category ? (
                <span className="rounded-full bg-surface-elevated px-2.5 py-0.5 font-normal text-muted ring-1 ring-border">
                  {current.category}
                </span>
              ) : null}
              <span className="tabular-nums">
                Added {formatIsoDate(current.created_at)}
              </span>
            </div>
            <p className="text-lg font-semibold leading-snug tracking-tight text-foreground sm:text-xl">
              <Link
                href={`/predictions/${encodeURIComponent(current.id)}`}
                className="hover:text-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {current.text}
              </Link>
            </p>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">
              <OutcomeBadge outcome={current.outcome} className="text-sm" />
              <span aria-hidden className="text-muted">
                ·
              </span>
              <Link
                href={`/source/${encodeURIComponent(current.sourceSlug)}`}
                className="font-normal text-ink underline-offset-2 hover:text-foreground hover:underline"
              >
                {current.source}
              </Link>
              <span aria-hidden className="text-muted">
                ·
              </span>
              <span className="min-w-0 text-muted">
                {accuracyPhrase}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap justify-end gap-4">
            <Link
              href={`/predictions/${encodeURIComponent(current.id)}`}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              View details
            </Link>
          </div>
        </div>

        {hasSlideControls ? (
          <>
            <div
              className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 sm:left-auto sm:right-6 sm:translate-x-0"
              role="group"
              aria-label="Slide indicators"
            >
              {slides.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-label={`Show prediction ${i + 1} of ${slides.length}`}
                  aria-current={i === safeIndex ? "true" : undefined}
                  onClick={() => setIndex(i)}
                >
                  <span
                    aria-hidden
                    className={`h-2.5 w-2.5 rounded-full transition-colors ${
                      i === safeIndex ? "bg-primary" : "bg-muted hover:bg-border"
                    }`}
                  />
                </button>
              ))}
            </div>
            <button
              type="button"
              aria-label="Previous slide"
              className="absolute left-2 top-1/2 hidden min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface-elevated/95 text-foreground shadow-sm hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive sm:inline-flex"
              onClick={() => go(-1)}
            >
              <span aria-hidden className="text-lg leading-none">
                ‹
              </span>
            </button>
            <button
              type="button"
              aria-label="Next slide"
              className="absolute right-2 top-1/2 hidden min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface-elevated/95 text-foreground shadow-sm hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive sm:inline-flex"
              onClick={() => go(1)}
            >
              <span aria-hidden className="text-lg leading-none">
                ›
              </span>
            </button>
          </>
        ) : null}

        <div
          id={`${baseId}-live`}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {current.text}. {current.outcome}. {current.source}. {accuracyPhrase}
        </div>
      </section>
    );
  },
);
