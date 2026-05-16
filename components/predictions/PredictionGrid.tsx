"use client";

import { memo } from "react";
import Link from "next/link";
import { OutcomeBadge } from "@/components/predictions/OutcomeBadge";
import { SourceAvatar } from "@/components/ui/SourceAvatar";
import { formatIsoDate, formatMonthYear } from "@/utils/format-date";
import type { Prediction } from "@/types/prediction";
import { truncateWithEllipsis } from "@/utils/truncate-text";

type PredictionGridProps = {
  predictions: Prediction[];
  loading: boolean;
  emptyMessage?: string;
};

const gridClass =
  "grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 lg:grid-cols-3";

export const PredictionGrid = memo(function PredictionGrid({
  predictions,
  loading,
  emptyMessage = "No predictions in this view yet.",
}: PredictionGridProps) {
  if (loading && predictions.length === 0) {
    return (
      <div
        className={gridClass.replace("list-none ", "")}
        aria-busy="true"
        aria-label="Loading predictions"
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-52 animate-pulse rounded-xl bg-surface" />
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
    <ul className={gridClass}>
      {predictions.map((p) => (
        <li key={p.id} className="min-w-0">
          <Link
            href={`/predictions/${encodeURIComponent(p.id)}`}
            className="group flex h-full min-h-[11.5rem] flex-col rounded-xl border border-border bg-surface-elevated p-5 shadow-[0_2px_12px_rgb(0_0_0/0.05)] transition-[box-shadow,border-color] hover:border-border hover:shadow-[0_8px_24px_rgb(0_0_0/0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="rounded-md bg-surface px-2 py-0.5 text-[0.6875rem] font-bold uppercase tracking-wide text-muted ring-1 ring-border">
                {p.category?.trim() ? p.category : "General"}
              </span>
              <OutcomeBadge outcome={p.outcome} className="shrink-0 text-sm" />
            </div>
            <p className="mt-3 line-clamp-3 flex-1 text-base font-semibold leading-snug text-foreground group-hover:text-ink">
              {truncateWithEllipsis(p.text, 160)}
            </p>
            <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
              <SourceAvatar name={p.source} size="sm" />
              <div className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground">
                  {p.source}
                </span>
                <span className="mt-0.5 block text-xs tabular-nums text-muted">
                  {p.target_date
                    ? `Target ${formatMonthYear(p.target_date)}`
                    : `Added ${formatIsoDate(p.created_at)}`}
                </span>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
});
