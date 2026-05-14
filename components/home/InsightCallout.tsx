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
        className={`rounded-xl border border-info/30 bg-info/10 px-4 py-3 ${className}`.trim()}
        role="status"
        aria-live="polite"
        aria-label="Loading insight"
      >
        <div className="h-3 w-20 animate-pulse rounded bg-info/30" />
        <div className="mt-2 h-4 max-w-[75%] animate-pulse rounded bg-info/20" />
      </div>
    );
  }

  if (insight === null) {
    return null;
  }

  return (
    <aside
      aria-label="Insight"
      className={`rounded-xl border border-info/35 bg-info/10 px-4 py-3 shadow-sm ${className}`.trim()}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-info">
        <span aria-hidden>💡</span> Insight
      </p>
      <p className="mt-1 text-sm leading-relaxed text-foreground">
        {insight.headline}
      </p>
    </aside>
  );
});
