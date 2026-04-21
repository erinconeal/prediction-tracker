"use client";

import Link from "next/link";
import { memo } from "react";
import { formatIsoDate } from "@/utils/format-date";
import type { Outcome, Prediction } from "@/types/prediction";

function shortPreview(text: string, max = 80): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}

type PredictionListProps = {
  predictions: Prediction[];
  loading: boolean;
  onOutcomeChange: (
    id: string,
    outcome: Exclude<Outcome, "pending">,
  ) => Promise<void>;
  emptyMessage?: string;
};

function outcomeBadge(outcome: Outcome) {
  const styles: Record<Outcome, string> = {
    pending:
      "bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200",
    correct:
      "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-200",
    incorrect: "bg-red-100 text-red-900 dark:bg-red-950/80 dark:text-red-200",
  };
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${styles[outcome]}`}
    >
      {outcome}
    </span>
  );
}

export const PredictionList = memo(function PredictionList({
  predictions,
  loading,
  onOutcomeChange,
  emptyMessage = "No predictions match these filters.",
}: PredictionListProps) {
  if (loading && predictions.length === 0) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Loading predictions">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800"
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
    <ul className="space-y-3">
      {predictions.map((p) => (
        <li
          key={p.id}
          className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/source/${encodeURIComponent(p.sourceSlug)}`}
                  className="rounded font-medium text-zinc-900 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-zinc-50 dark:focus-visible:ring-zinc-500 dark:focus-visible:ring-offset-zinc-900"
                  aria-label={`View all predictions for ${p.source}`}
                >
                  {p.source}
                </Link>
                {outcomeBadge(p.outcome)}
                {p.category ? (
                  <span className="text-xs text-zinc-600 dark:text-zinc-300">
                    {p.category}
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                {p.text}
              </p>
              <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-300">
                Added {formatIsoDate(p.created_at)}
                {p.target_date
                  ? ` · Target ${formatIsoDate(p.target_date)}`
                  : null}
              </p>
            </div>
            {p.outcome === "pending" ? (
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:focus-visible:ring-zinc-500 dark:focus-visible:ring-offset-zinc-900"
                  aria-label={`Mark as correct: ${shortPreview(p.text)}`}
                  onClick={() => void onOutcomeChange(p.id, "correct")}
                >
                  Mark correct
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:focus-visible:ring-zinc-500 dark:focus-visible:ring-offset-zinc-900"
                  aria-label={`Mark as incorrect: ${shortPreview(p.text)}`}
                  onClick={() => void onOutcomeChange(p.id, "incorrect")}
                >
                  Mark incorrect
                </button>
              </div>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
});
