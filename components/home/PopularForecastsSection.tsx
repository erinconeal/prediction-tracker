'use client';

import Link from 'next/link';
import { memo } from 'react';

import { PopularForecastCard } from '@/components/home/PopularForecastCard';
import { LoadingRegion } from '@/components/ui/LoadingRegion';
import { Skeleton } from '@/components/ui/Skeleton';
import { POPULAR_FORECAST_GRID_CLASS } from '@/lib/popular-forecast-columns';
import type { Prediction } from '@/types/prediction';

type PopularForecastsSectionProps = {
  predictions: Prediction[];
  statsContext: Prediction[];
  slotCount: number;
  seeAllHref?: string;
  loading?: boolean;
  className?: string;
};

function PopularForecastsSkeleton({ slotCount }: { slotCount: number }) {
  return (
    <LoadingRegion
      as="ul"
      label="Loading popular forecasts"
      className={POPULAR_FORECAST_GRID_CLASS}
    >
      {Array.from({ length: slotCount }, (_, i) => (
        <li key={i}>
          <Skeleton className="h-52 rounded-xl border border-border" />
        </li>
      ))}
    </LoadingRegion>
  );
}

export const PopularForecastsSection = memo(function PopularForecastsSection({
  predictions,
  statsContext,
  slotCount,
  seeAllHref = '#forecasts-heading',
  loading = false,
  className = '',
}: PopularForecastsSectionProps) {
  const visiblePredictions = predictions.slice(0, slotCount);
  return (
    <div className={`px-5 pb-6 pt-2 sm:px-8 sm:pb-8 ${className}`.trim()}>
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2
          className="font-serif text-xl font-normal tracking-tight text-foreground sm:text-2xl"
        >
          Popular forecasts
        </h2>
        <Link
          href={seeAllHref}
          className="inline-flex min-h-11 shrink-0 items-center gap-0.5 text-sm font-medium text-interactive hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          See all
          <span aria-hidden>›</span>
        </Link>
      </div>

      {loading
        ? (
            <PopularForecastsSkeleton slotCount={slotCount} />
          )
        : visiblePredictions.length === 0
          ? (
              <p className="text-sm text-muted">No forecasts to highlight yet.</p>
            )
          : (
              <ul className={POPULAR_FORECAST_GRID_CLASS}>
                {visiblePredictions.map(p => (
                  <li key={p.id}>
                    <PopularForecastCard
                      prediction={p}
                      statsContext={statsContext}
                    />
                  </li>
                ))}
              </ul>
            )}
    </div>
  );
});
