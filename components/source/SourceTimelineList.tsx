'use client';

import { memo } from 'react';

import { BrowseForecastCard } from '@/components/predictions/BrowseForecastCard';
import { LoadingRegion } from '@/components/ui/LoadingRegion';
import { Skeleton } from '@/components/ui/Skeleton';
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
      <LoadingRegion as="ul" label="Loading predictions" className="space-y-3">
        {[1, 2, 3].map(i => (
          <li key={i} className="list-none">
            <Skeleton className="h-28 rounded-xl" />
          </li>
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
    <ul className="space-y-3">
      {predictions.map(p => (
        <li key={p.id} className="list-none">
          <BrowseForecastCard
            prediction={p}
            hideSourceHeader
            readOnlyOutcome
            showSourceFeedDate
          />
        </li>
      ))}
    </ul>
  );
});
