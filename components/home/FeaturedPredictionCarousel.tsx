"use client";

import {
  memo,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { OutcomeBadge } from "@/components/predictions/OutcomeBadge";
import { DEFAULT_MAX_FEATURED_SLIDES } from "@/lib/featured-feed";
import {
  computeSourceAccuracyStats,
  type SourceAccuracyStats,
} from "@/lib/source-stats";
import { formatIsoDate } from "@/utils/format-date";
import type { Prediction } from "@/types/prediction";

const FEATURED_CARD_SHELL_CLASS =
  "flex flex-col overflow-hidden rounded-xl border border-border bg-surface-elevated shadow-[0_4px_24px_rgb(0_0_0/0.07)]";

const SLIDE_NAV_LABEL_MAX = 32;

function truncateSlideLabel(text: string, maxLen = SLIDE_NAV_LABEL_MAX): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLen) return trimmed;
  return `${trimmed.slice(0, maxLen - 1)}…`;
}

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

type FeaturedPredictionCarouselShellProps = {
  header?: ReactNode;
  children: ReactNode;
  className?: string;
  /** Passed to the outer section when the shell wraps interactive carousel content. */
  carouselLabel?: string;
};

export function FeaturedPredictionCarouselShell({
  header,
  children,
  className = "",
  carouselLabel,
}: FeaturedPredictionCarouselShellProps) {
  return (
    <section
      className={`${FEATURED_CARD_SHELL_CLASS} ${className}`.trim()}
      {...(carouselLabel !== undefined
        ? {
            "aria-roledescription": "carousel",
            "aria-label": carouselLabel,
          }
        : {})}
    >
      {header}
      {children}
    </section>
  );
}

type FeaturedPredictionCarouselProps = {
  predictions: Prediction[];
  /** Eyebrow framing why the carousel matters (e.g. week vs highlights). */
  spotlightTitle: string;
  /** Loaded feed (or broader list) used to compute per-source accuracy counts. */
  statsContextPredictions?: Prediction[];
  /** Slot above carousel slides (e.g. trending topics strip). */
  header?: ReactNode;
  className?: string;
};

export const FeaturedPredictionCarousel = memo(
  function FeaturedPredictionCarousel({
    predictions,
    spotlightTitle,
    statsContextPredictions,
    header,
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
    const prevIndex =
      slides.length === 0
        ? 0
        : (safeIndex - 1 + slides.length) % slides.length;
    const nextIndex =
      slides.length === 0 ? 0 : (safeIndex + 1) % slides.length;
    const prevSlide = slides[prevIndex];
    const nextSlide = slides[nextIndex];
    const prevLabel =
      prevSlide !== undefined ? truncateSlideLabel(prevSlide.text) : "";
    const nextLabel =
      nextSlide !== undefined ? truncateSlideLabel(nextSlide.text) : "";

    return (
      <div
        className={`space-y-3 ${className}`.trim()}
        role="region"
        aria-roledescription="carousel"
        aria-label={`${spotlightTitle}. Featured predictions.`}
      >
        <FeaturedPredictionCarouselShell header={header}>
          <div className="relative flex min-h-[14rem] flex-col">
            <div className="flex min-h-[200px] flex-1 flex-col justify-between gap-6 p-6 sm:p-8">
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
                <p className="font-serif text-xl font-normal leading-snug tracking-tight text-foreground sm:text-2xl">
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
                  <span className="min-w-0 text-muted">{accuracyPhrase}</span>
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

            <div
              id={`${baseId}-live`}
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="sr-only"
            >
              {current.text}. {current.outcome}. {current.source}. {accuracyPhrase}
            </div>
          </div>
        </FeaturedPredictionCarouselShell>

        {hasSlideControls ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div
              className="flex items-center gap-1.5"
              role="group"
              aria-label="Slide indicators"
            >
              {slides.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  className="inline-flex size-11 shrink-0 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-label={`Show prediction ${i + 1} of ${slides.length}`}
                  aria-current={i === safeIndex ? "true" : undefined}
                  onClick={() => setIndex(i)}
                >
                  <span
                    aria-hidden
                    className={`rounded-full transition-colors ${
                      i === safeIndex
                        ? "h-2 w-6 bg-foreground"
                        : "size-2 bg-border hover:bg-muted"
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                aria-label={
                  prevSlide !== undefined
                    ? `Previous slide: ${prevSlide.text}`
                    : "Previous slide"
                }
                className="inline-flex min-h-11 max-w-full items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-4"
                onClick={() => go(-1)}
              >
                <span aria-hidden className="text-base leading-none text-muted">
                  ‹
                </span>
                <span className="max-w-[9rem] truncate sm:max-w-[12rem]">
                  {prevLabel}
                </span>
              </button>
              <button
                type="button"
                aria-label={
                  nextSlide !== undefined
                    ? `Next slide: ${nextSlide.text}`
                    : "Next slide"
                }
                className="inline-flex min-h-11 max-w-full items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-sm hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-4"
                onClick={() => go(1)}
              >
                <span className="max-w-[9rem] truncate sm:max-w-[12rem]">
                  {nextLabel}
                </span>
                <span aria-hidden className="text-base leading-none text-muted">
                  ›
                </span>
              </button>
            </div>
          </div>
        ) : null}
      </div>
    );
  },
);
