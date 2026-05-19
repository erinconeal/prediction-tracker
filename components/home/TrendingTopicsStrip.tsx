"use client";

import Link from "next/link";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import type { TrendingTopicEntry } from "@/lib/trending-topics";

type TrendingTopicsStripProps = {
  topics: TrendingTopicEntry[];
  activeSlug?: string | null;
  loading?: boolean;
  /** When true, styles for the top row inside the hero marketing card. */
  embedded?: boolean;
  className?: string;
};

function TrendIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`block size-3.5 shrink-0 ${className}`.trim()}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d="M2 11l4-4 3 3 5-6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      className="block size-4 shrink-0"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d={direction === "right" ? "M6 4l4 4-4 4" : "M10 4L6 8l4 4"}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

const topicLinkClass =
  "relative inline-flex h-5 items-center whitespace-nowrap text-sm font-medium leading-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const scrollListClass =
  "flex list-none gap-x-5 overflow-x-auto overflow-y-visible scroll-smooth transition-[padding] duration-200 ease-out motion-reduce:transition-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden";

const scrollEdgeButtonClass =
  "relative z-[2] inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center bg-transparent text-foreground transition-colors hover:text-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const scrollEdgeShellClass =
  "absolute inset-y-0 z-[1] flex w-24 items-center transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none";

type ScrollEdgeProps = {
  side: "left" | "right";
  embedded: boolean;
  visible: boolean;
  label: string;
  onClick: () => void;
};

function ScrollEdge({
  side,
  embedded,
  visible,
  label,
  onClick,
}: ScrollEdgeProps) {
  const isRight = side === "right";
  const fadeGradientClass = embedded
    ? isRight
      ? "bg-gradient-to-r from-transparent from-0% via-surface-elevated via-[35%] to-surface-elevated"
      : "bg-gradient-to-l from-transparent from-0% via-surface-elevated via-[35%] to-surface-elevated"
    : isRight
      ? "bg-gradient-to-r from-transparent from-0% via-background via-[35%] to-background"
      : "bg-gradient-to-l from-transparent from-0% via-background via-[35%] to-background";

  return (
    <div
      className={`${scrollEdgeShellClass} ${
        isRight ? "right-0 justify-end" : "left-0 justify-start"
      } ${
        visible
          ? "pointer-events-auto translate-x-0 opacity-100"
          : `pointer-events-none opacity-0 ${
              isRight ? "translate-x-1.5" : "-translate-x-1.5"
            }`
      }`}
      aria-hidden={!visible}
    >
      <div
        className={`pointer-events-none absolute inset-0 ${fadeGradientClass}`}
        aria-hidden
      />
      <button
        type="button"
        className={`${scrollEdgeButtonClass} ${isRight ? "pr-1" : "pl-1"}`}
        aria-label={label}
        tabIndex={visible ? 0 : -1}
        onClick={onClick}
      >
        <ChevronIcon direction={isRight ? "right" : "left"} />
      </button>
    </div>
  );
}

type TrendingTopicsScrollerProps = {
  embedded: boolean;
  loading: boolean;
  topics: TrendingTopicEntry[];
  activeSlug: string | null;
};

function TrendingTopicsScroller({
  embedded,
  loading,
  topics,
  activeSlug,
}: TrendingTopicsScrollerProps) {
  const scrollRef = useRef<HTMLUListElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollAffordances = useCallback(() => {
    const el = scrollRef.current;
    if (!el) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = el;
    const overflow = scrollWidth - clientWidth > 1;
    setCanScrollLeft(overflow && scrollLeft > 1);
    setCanScrollRight(overflow && scrollLeft + clientWidth < scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollAffordances();

    const onScroll = () => updateScrollAffordances();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateScrollAffordances);

    let resizeObserver: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => updateScrollAffordances());
      resizeObserver.observe(el);
      for (const child of el.children) {
        resizeObserver.observe(child);
      }
    }

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateScrollAffordances);
      resizeObserver?.disconnect();
    };
  }, [loading, topics, updateScrollAffordances]);

  const scrollByPage = useCallback((direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    const step = Math.max(el.clientWidth * 0.85, 120);
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    el.scrollBy({
      left: direction === "right" ? step : -step,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }, []);

  const listPadClass =
    `${canScrollLeft ? "pl-10" : ""} ${canScrollRight ? "pr-10" : ""}`.trim();

  return (
    <div className="relative min-w-0 flex-1">
      <ScrollEdge
        side="left"
        embedded={embedded}
        visible={canScrollLeft}
        label="Show earlier trending topics"
        onClick={() => scrollByPage("left")}
      />

      <ScrollEdge
        side="right"
        embedded={embedded}
        visible={canScrollRight}
        label="Show more trending topics"
        onClick={() => scrollByPage("right")}
      />

      {loading ? (
        <ul
          ref={scrollRef}
          className={`${scrollListClass} ${listPadClass}`.trim()}
          aria-busy="true"
          aria-label="Loading trending topics"
        >
          {Array.from({ length: 4 }, (_, i) => (
            <li
              key={i}
              className="h-5 w-24 shrink-0 animate-pulse rounded bg-surface"
            />
          ))}
        </ul>
      ) : (
        <ul
          ref={scrollRef}
          className={`${scrollListClass} flex-nowrap ${listPadClass}`.trim()}
        >
          {topics.map(({ topic, count }) => {
            const isActive = activeSlug === topic.slug;
            return (
              <li
                key={topic.id}
                className={`flex shrink-0 items-center ${isActive ? "pl-5" : ""}`}
              >
                <Link
                  href={`/topics/${topic.slug}`}
                  className={`${topicLinkClass} ${
                    isActive
                      ? "text-interactive"
                      : "text-muted hover:text-foreground"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {isActive ? (
                    <span
                      className="pointer-events-none absolute right-[calc(100%+0.375rem)] top-1/2 inline-flex size-3.5 -translate-y-1/2 items-center justify-center"
                      aria-hidden
                    >
                      <TrendIcon />
                    </span>
                  ) : null}
                  {topic.name}
                  <span className="sr-only"> ({count} predictions)</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export const TrendingTopicsStrip = memo(function TrendingTopicsStrip({
  topics,
  activeSlug = null,
  loading = false,
  embedded = false,
  className = "",
}: TrendingTopicsStripProps) {
  if (!loading && topics.length === 0) {
    return null;
  }

  return (
    <nav
      className={`flex items-center gap-4 border-b border-border/70 sm:gap-5 ${
        embedded
          ? "px-5 py-4 sm:px-8 sm:py-5"
          : "flex-col gap-3 pb-6 sm:flex-row sm:items-center"
      } ${className}`.trim()}
      aria-labelledby="trending-topics-heading"
    >
      <div className="flex h-5 shrink-0 items-center gap-2">
        <span
          className="size-2 shrink-0 rounded-full bg-error"
          aria-hidden
        />
        <h2
          id="trending-topics-heading"
          className="whitespace-nowrap text-xs font-semibold uppercase tracking-wide text-muted"
        >
          Trending topics
        </h2>
      </div>

      <TrendingTopicsScroller
        embedded={embedded}
        loading={loading}
        topics={topics}
        activeSlug={activeSlug}
      />
    </nav>
  );
});
