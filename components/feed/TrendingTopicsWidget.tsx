"use client";

import Link from "next/link";
import { memo } from "react";
import type { TrendingTopicDto } from "@/services/api";

type TrendingTopicsWidgetProps = {
  topics: TrendingTopicDto[];
  loading?: boolean;
  className?: string;
};

export const TrendingTopicsWidget = memo(function TrendingTopicsWidget({
  topics,
  loading = false,
  className = "",
}: TrendingTopicsWidgetProps) {
  return (
    <section
      className={`rounded-xl bg-interactive p-4 text-white shadow-sm ${className}`.trim()}
      aria-labelledby="sidebar-trending-heading"
    >
      <h2
        id="sidebar-trending-heading"
        className="flex items-center gap-2 text-sm font-semibold"
      >
        <span aria-hidden>↗</span>
        Trending topics
      </h2>
      {loading ? (
        <ul className="mt-3 space-y-2" aria-busy="true">
          {[1, 2, 3].map((i) => (
            <li key={i} className="list-none">
              <div className="h-10 animate-pulse rounded-lg bg-white/20" />
            </li>
          ))}
        </ul>
      ) : topics.length === 0 ? (
        <p className="mt-3 text-sm text-white/80">No trending topics yet.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {topics.map((t) => (
            <li key={t.id} className="list-none">
              <Link
                href={`/topics/${t.slug}`}
                className="flex items-center justify-between gap-2 rounded-lg bg-white/10 px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-interactive"
              >
                <span className="min-w-0 truncate">{t.name}</span>
                <span className="shrink-0 text-xs text-white/80">
                  {formatCount(t.count)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link
        href="/"
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-white/30 bg-white px-3 py-2 text-sm font-semibold text-interactive transition-colors hover:bg-white/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-interactive"
      >
        Explore all topics
      </Link>
    </section>
  );
});

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
