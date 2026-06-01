'use client';

import { memo } from 'react';
import { BrowseForecastCard } from '@/components/predictions/BrowseForecastCard';
import type { Prediction } from '@/types/prediction';

type SourceTimelineListProps = {
  predictions: Prediction[];
  loading: boolean;
  emptyMessage?: string;
};

export const SourceTimelineList = memo(function SourceTimelineList({
  predictions,
  loading,
  emptyMessage = 'No forecasts recorded for this source yet.',
}: SourceTimelineListProps) {
  if (loading && predictions.length === 0) {
    return (
      <ul className="space-y-3" aria-busy="true" aria-label="Loading predictions">
        {[1, 2, 3].map(i => (
          <li key={i} className="list-none">
            <div className="h-28 animate-pulse rounded-xl bg-surface" />
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
    <ul className="space-y-3">
      {predictions.map(p => (
        <li key={p.id} className="list-none">
          <BrowseForecastCard
            prediction={p}
            hideSourceHeader
            readOnlyOutcome
          />
        </li>
      ))}
    </ul>
  );
});
