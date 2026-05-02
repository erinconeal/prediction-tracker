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
            className="h-44 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800"
          />
        ))}
      </div>
    );
  }

  if (!loading && predictions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900/40 dark:text-zinc-300">
        {emptyMessage}
      </div>
    );
  }

  return (
    <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {predictions.map((p) => (
        <li key={p.id} className="min-w-0">
          <Link
            href={`/predictions/${encodeURIComponent(p.id)}`}
            className="flex h-full flex-col rounded-xl border border-zinc-200 bg-white p-4 shadow-sm transition-shadow hover:border-zinc-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-600 dark:focus-visible:ring-offset-zinc-950"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="line-clamp-3 min-w-0 flex-1 text-base font-semibold leading-snug text-zinc-900 dark:text-zinc-50">
                {truncateWithEllipsis(p.text, 140)}
              </p>
              <OutcomeBadge outcome={p.outcome} className="shrink-0 text-sm" />
            </div>
            <div className="mt-3 flex flex-1 flex-col justify-end border-t border-zinc-100 pt-3 dark:border-zinc-800">
              <span className="truncate text-sm font-normal text-zinc-600 dark:text-zinc-400">
                {p.source}
              </span>
              <span className="mt-0.5 text-xs tabular-nums text-zinc-500 dark:text-zinc-500">
                {p.target_date
                  ? `Target ${formatMonthYear(p.target_date)}`
                  : "No target date"}
              </span>
              {p.category ? (
                <span className="mt-1 max-w-full truncate text-xs tracking-wide text-zinc-500 dark:text-zinc-500">
                  {p.category}
                </span>
              ) : (
                <span className="mt-1 text-xs tracking-wide text-zinc-500 dark:text-zinc-500">
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
