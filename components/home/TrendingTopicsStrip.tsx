"use client";

import Link from "next/link";
import { memo } from "react";
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

const topicLinkClass =
  "relative inline-flex h-5 items-center whitespace-nowrap text-sm font-medium leading-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background";

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

      {loading ? (
        <ul
          className="-mx-1 flex list-none gap-4 overflow-x-auto px-1"
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
          className="-mx-1 flex min-w-0 flex-1 list-none flex-wrap items-center gap-x-5 gap-y-2 overflow-x-auto px-1 scroll-smooth [scrollbar-width:thin] sm:flex-nowrap"
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
    </nav>
  );
});
