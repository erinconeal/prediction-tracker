'use client';

import { memo } from 'react';

import { browseForecastGridClass } from '@/components/forecast/forecast-card-tokens';
import { BrowseForecastCard } from '@/components/predictions/BrowseForecastCard';
import { LoadingRegion } from '@/components/ui/LoadingRegion';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Outcome, Prediction } from '@/types/prediction';

type PredictionGridProps = {
  predictions: Prediction[];
  loading: boolean;
  emptyMessage?: string;
  onOutcomeFilter: (outcome: Outcome) => void;
};

export const PredictionGrid = memo(function PredictionGrid({
  predictions,
  loading,
  emptyMessage = 'No predictions in this view yet.',
  onOutcomeFilter,
}: PredictionGridProps) {
  if (loading && predictions.length === 0) {
    return (
      <LoadingRegion
        label="Loading predictions"
        className={browseForecastGridClass.replace('list-none ', '')}
      >
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Skeleton key={i} className="h-52 rounded-xl" />
        ))}
      </LoadingRegion>
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
