"use client";

import { memo } from "react";
import { BrowseForecastCard } from "@/components/predictions/BrowseForecastCard";
import type { CategoryTab } from "@/lib/category-tabs";
import type { Outcome, Prediction } from "@/types/prediction";

type PredictionFeedListProps = {
  predictions: Prediction[];
  loading: boolean;
  emptyMessage?: string;
  outcomeFilter: Outcome | "all";
  onOutcomeFilter: (outcome: Outcome) => void;
  onCategorySelect?: (tab: CategoryTab) => void;
};

export const PredictionFeedList = memo(function PredictionFeedList({
  predictions,
  loading,
  emptyMessage = "No predictions in this view yet.",
  outcomeFilter,
  onOutcomeFilter,
  onCategorySelect,
}: PredictionFeedListProps) {
  if (loading && predictions.length === 0) {
    return (
      <ul className="space-y-4" aria-busy="true" aria-label="Loading predictions">
        {[1, 2, 3, 4].map((i) => (
          <li key={i} className="list-none">
            <div className="h-40 animate-pulse rounded-xl bg-surface" />
          </li>
        ))}
      </ul>
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
    <ul className="space-y-4">
      {predictions.map((p) => (
        <li key={p.id} className="list-none">
          <BrowseForecastCard
            prediction={p}
            outcomeFilter={outcomeFilter}
            onOutcomeFilter={onOutcomeFilter}
            onCategorySelect={onCategorySelect}
          />
        </li>
      ))}
    </ul>
  );
});
