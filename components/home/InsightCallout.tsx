"use client";

import { memo } from "react";
import type { Insight } from "@/lib/insights";

type InsightCalloutProps = {
  insight: Insight | null;
  loading: boolean;
  className?: string;
};

/**
 * One-liner takeaway derived from the dataset (e.g. "Jane Analyst has been
 * correct on 2/2 predictions"). Renders nothing when no insight is available
 * so the layout stays uncluttered when there is nothing interesting to say.
 */
export const InsightCallout = memo(function InsightCallout({
  insight,
  loading,
  className = "",
}: InsightCalloutProps) {
  if (loading && insight === null) {
    return (
      <div
        className={`rounded-xl border border-blue-200/70 bg-blue-50/70 px-4 py-3 dark:border-blue-900/60 dark:bg-blue-950/30 ${className}`.trim()}
        role="status"
        aria-live="polite"
        aria-label="Loading insight"
      >
        <div className="h-3 w-20 animate-pulse rounded bg-blue-200/80 dark:bg-blue-900/60" />
        <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-blue-200/60 dark:bg-blue-900/50" />
      </div>
    );
  }

  if (insight === null) {
    return null;
  }

  return (
    <aside
      aria-label="Insight"
      className={`rounded-xl border border-blue-200/70 bg-blue-50 px-4 py-3 shadow-sm dark:border-blue-900/60 dark:bg-blue-950/40 ${className}`.trim()}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-blue-800 dark:text-blue-300">
        <span aria-hidden>💡</span> Insight
      </p>
      <p className="mt-1 text-sm leading-relaxed text-zinc-900 dark:text-zinc-50">
        {insight.headline}
      </p>
    </aside>
  );
});
