"use client";

import { memo } from "react";
import { BROWSE_FORECAST_GRID_CLASS } from "@/components/forecast/forecast-card-tokens";
import { BrowseForecastCard } from "@/components/predictions/BrowseForecastCard";
import type { Outcome, Prediction } from "@/types/prediction";
import type { CategoryTab } from "@/lib/category-tabs";

type PredictionGridProps = {
  predictions: Prediction[];
  loading: boolean;
  emptyMessage?: string;
  outcomeFilter: Outcome | "all";
  onOutcomeFilter: (outcome: Outcome) => void;
  onCategorySelect?: (tab: CategoryTab) => void;
};

export const PredictionGrid = memo(function PredictionGrid({
  predictions,
  loading,
  emptyMessage = "No predictions in this view yet.",
  outcomeFilter,
  onOutcomeFilter,
  onCategorySelect,
}: PredictionGridProps) {
  if (loading && predictions.length === 0) {
    return (
      <div
        className={BROWSE_FORECAST_GRID_CLASS.replace("list-none ", "")}
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
    <ul className={BROWSE_FORECAST_GRID_CLASS}>
      {predictions.map((p) => (
        <li key={p.id} className="min-w-0">
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
