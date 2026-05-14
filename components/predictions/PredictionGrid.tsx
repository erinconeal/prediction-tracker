"use client";

import { memo } from "react";
import Link from "next/link";
import { OutcomeBadge } from "@/components/predictions/OutcomeBadge";
import { formatMonthYear } from "@/utils/format-date";
import type { Prediction } from "@/types/prediction";
import { truncateWithEllipsis } from "@/utils/truncate-text";

type PredictionGridProps = {
  predictions: Prediction[];
  loading: boolean;
  emptyMessage?: string;
};

export const PredictionGrid = memo(function PredictionGrid({
  predictions,
  loading,
  emptyMessage = "No predictions in this view yet.",
}: PredictionGridProps) {
  if (loading && predictions.length === 0) {
    return (
      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        aria-busy="true"
        aria-label="Loading predictions"
      >
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-44 animate-pulse rounded-xl bg-surface"
          />
        ))}
      </div>
    );
  }

  if (!loading && predictions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-12 text-center text-sm text-muted">
        {emptyMessage}
      </div>
    );
  }

  return (
    <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {predictions.map((p) => (
        <li key={p.id} className="min-w-0">
          <Link
            href={`/predictions/${encodeURIComponent(p.id)}`}
            className="flex h-full flex-col rounded-xl border border-border bg-surface-elevated p-4 shadow-sm transition-shadow hover:border-border hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="line-clamp-3 min-w-0 flex-1 text-base font-semibold leading-snug text-foreground">
                {truncateWithEllipsis(p.text, 140)}
              </p>
              <OutcomeBadge outcome={p.outcome} className="shrink-0 text-sm" />
            </div>
            <div className="mt-3 flex flex-1 flex-col justify-end border-t border-border pt-3">
              <span className="truncate text-sm font-normal text-muted">
                {p.source}
              </span>
              <span className="mt-0.5 text-xs tabular-nums text-muted">
                {p.target_date
                  ? `Target ${formatMonthYear(p.target_date)}`
                  : "No target date"}
              </span>
              {p.category ? (
                <span className="mt-1 max-w-full truncate text-xs tracking-wide text-muted">
                  {p.category}
                </span>
              ) : (
                <span className="mt-1 text-xs tracking-wide text-muted">
                  Uncategorized
                </span>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
});
