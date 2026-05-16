"use client";

import { memo } from "react";
import type { TopicTab } from "@/components/home/CategoryTopicTabs";
import type { TrendingTopic } from "@/lib/trending-topics";

type TrendingTopicsStripProps = {
  topics: TrendingTopic[];
  active: TopicTab;
  onSelect: (tab: TopicTab) => void;
  loading?: boolean;
  /** When true, styles for the top row inside the hero marketing card. */
  embedded?: boolean;
  /** When true with `embedded`, prepends an “All” topic control. */
  showAllTopic?: boolean;
  className?: string;
};

function TrendIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`size-3.5 shrink-0 ${className}`.trim()}
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

export const TrendingTopicsStrip = memo(function TrendingTopicsStrip({
  topics,
  active,
  onSelect,
  loading = false,
  embedded = false,
  showAllTopic = false,
  className = "",
}: TrendingTopicsStripProps) {
  if (!loading && topics.length === 0 && !(embedded && showAllTopic)) {
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
      <div className="flex shrink-0 items-center gap-2">
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
          className="-mx-1 flex min-w-0 flex-1 list-none flex-wrap items-center gap-x-5 gap-y-2 overflow-x-auto px-1 pb-0.5 scroll-smooth [scrollbar-width:thin] sm:flex-nowrap"
        >
          {embedded && showAllTopic ? (
            <li key="All" className="shrink-0">
              <button
                type="button"
                aria-pressed={active === "All"}
                onClick={() => onSelect("All")}
                className={`inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  active === "All"
                    ? "text-interactive"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {active === "All" ? <TrendIcon /> : null}
                All
              </button>
            </li>
          ) : null}
          {topics.map(({ topic }) => {
            const isActive = active === topic;
            return (
              <li key={topic} className="shrink-0">
                <button
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => onSelect(topic)}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                    isActive
                      ? "text-interactive"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  {isActive ? <TrendIcon /> : null}
                  {topic}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </nav>
  );
});
