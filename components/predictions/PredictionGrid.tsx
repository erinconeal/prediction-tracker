'use client';

import { memo } from 'react';
import { browseForecastGridClass } from '@/components/forecast/forecast-card-tokens';
import { BrowseForecastCard } from '@/components/predictions/BrowseForecastCard';
import type { Outcome, Prediction } from '@/types/prediction';

type PredictionGridProps = {
  predictions: Prediction[];
  loading: boolean;
  emptyMessage?: string;
  outcomeFilter: Outcome | 'all';
  onOutcomeFilter: (outcome: Outcome) => void;
};

export const PredictionGrid = memo(function PredictionGrid({
  predictions,
  loading,
  emptyMessage = 'No predictions in this view yet.',
  outcomeFilter,
  onOutcomeFilter,
}: PredictionGridProps) {
  if (loading && predictions.length === 0) {
    return (
      <div
        className={browseForecastGridClass.replace('list-none ', '')}
        aria-busy="true"
        aria-label="Loading predictions"
      >
        {[1, 2, 3, 4, 5, 6].map(i => (
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
    <ul className={browseForecastGridClass}>
      {predictions.map(p => (
        <li key={p.id} className="min-w-0">
          <BrowseForecastCard
            prediction={p}
            onOutcomeFilter={onOutcomeFilter}
          />
        </li>
      ))}
    </ul>
  );
});
