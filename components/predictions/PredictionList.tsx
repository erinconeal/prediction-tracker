"use client";

import { memo } from "react";
import type { Outcome, Prediction } from "@/types/prediction";
import { truncateWithEllipsis } from "@/utils/truncate-text";
import { PredictionCard } from "./PredictionCard";

type PredictionListProps = {
  predictions: Prediction[];
  loading: boolean;
  onOutcomeChange: (
    id: string,
    outcome: Exclude<Outcome, "pending">,
  ) => Promise<void>;
  emptyMessage?: string;
};

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
        <li key={p.id} className="list-none">
          <PredictionCard
            prediction={p}
            size="compact"
            showCreatedAt
            footerSlot={
              p.outcome === "pending" ? (
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:focus-visible:ring-zinc-500 dark:focus-visible:ring-offset-zinc-900"
                    aria-label={`Mark as correct: ${truncateWithEllipsis(p.text, 80)}`}
                    onClick={() => void onOutcomeChange(p.id, "correct")}
                  >
                    Mark correct
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-900 hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:focus-visible:ring-zinc-500 dark:focus-visible:ring-offset-zinc-900"
                    aria-label={`Mark as incorrect: ${truncateWithEllipsis(p.text, 80)}`}
                    onClick={() => void onOutcomeChange(p.id, "incorrect")}
                  >
                    Mark incorrect
                  </button>
                </div>
              ) : null
            }
          />
        </li>
      ))}
    </ul>
  );
});
