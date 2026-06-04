'use client';

import { useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { PredictionDetailHeader } from '@/components/predictions/detail/PredictionDetailHeader';
import { PredictionLifecycleTimeline } from '@/components/predictions/detail/PredictionLifecycleTimeline';
import { PredictionSourceSidebar } from '@/components/predictions/detail/PredictionSourceSidebar';
import { usePrediction } from '@/hooks/usePrediction';
import { usePredictions } from '@/hooks/usePredictions';
import { computeSourceAccuracyStats } from '@/lib/source-stats';
import {
  isSourceStatsSnapshotCapped,
  SOURCE_STATS_SNAPSHOT_LIMIT,
} from '@/lib/source-stats-snapshot';

const IDLE_SOURCE = '__no_match_for_stats_idle__';

const linkBack
  = 'inline-flex min-h-11 items-center text-sm font-medium text-interactive underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background';

type PredictionDetailViewProps = {
  id: string;
};

export function PredictionDetailView({ id }: PredictionDetailViewProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const { prediction, loading, error }
    = usePrediction(id);

  useEffect(() => {
    if (prediction) {
      headingRef.current?.focus();
    }
  }, [prediction?.id]);

  const statsFilters = useMemo(
    () => ({
      source: prediction?.sourceSlug ?? IDLE_SOURCE,
      status: 'all' as const,
      limit: SOURCE_STATS_SNAPSHOT_LIMIT,
    }),
    [prediction?.sourceSlug],
  );

  const {
    data: sourcePredictions,
    loading: statsLoading,
  } = usePredictions(statsFilters);

  const stats = useMemo(
    () =>
      computeSourceAccuracyStats(sourcePredictions, {
        nameFallback: '',
        primaryName: prediction?.source ?? null,
      }),
    [sourcePredictions, prediction?.source],
  );

  const statsSnapshotCapped = isSourceStatsSnapshotCapped(
    sourcePredictions.length,
  );
  const showStatsSkeleton = statsLoading && sourcePredictions.length === 0;

  if (loading && !prediction) {
    return (
      <div className="space-y-8" aria-busy="true">
        <div className="h-5 w-56 animate-pulse rounded bg-surface" />
        <div className="h-48 animate-pulse rounded-xl bg-surface" />
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-8">
            <div className="h-40 animate-pulse rounded-xl bg-surface" />
            <div className="h-32 animate-pulse rounded-xl bg-surface" />
          </div>
          <div className="lg:col-span-4">
            <div className="h-64 animate-pulse rounded-xl bg-surface" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div className="rounded-xl border border-border bg-surface-elevated p-8 text-center">
        <p className="text-sm text-muted">{error ?? 'Prediction not found.'}</p>
        <Link href="/" className={`mt-4 inline-block ${linkBack}`}>
          Back to home
        </Link>
      </div>
    );
  }

  const p = prediction;

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="order-1 space-y-8 lg:col-span-8">
          <PredictionDetailHeader
            ref={headingRef}
            text={p.text}
            outcome={p.outcome}
            createdAt={p.created_at}
            targetDate={p.target_date}
            finishedAt={p.finished_at}
            topicIds={p.topicIds}
          />

          <PredictionLifecycleTimeline
            createdAt={p.created_at}
            targetDate={p.target_date}
            finishedAt={p.finished_at}
            outcome={p.outcome}
          />
        </div>

        <div className="order-2 lg:col-span-4">
          <div className="lg:sticky lg:top-8">
            <PredictionSourceSidebar
              sourceName={p.source}
              sourceSlug={p.sourceSlug}
              stats={stats}
              loading={showStatsSkeleton}
              snapshotCapped={statsSnapshotCapped}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
