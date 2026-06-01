'use client';

import { useMemo } from 'react';
import { SourceDetailHeader } from '@/components/source/SourceDetailHeader';
import { SourceStatsSidebar } from '@/components/source/SourceStatsSidebar';
import { SourceTimelineList } from '@/components/source/SourceTimelineList';
import { usePredictions } from '@/hooks/usePredictions';
import { humanizeSlug } from '@/lib/humanize-slug';
import { computeSourceAccuracyStats } from '@/lib/source-stats';

type SourceDetailViewProps = {
  sourceSlug: string;
};

export function SourceDetailView({ sourceSlug }: SourceDetailViewProps) {
  const filters = useMemo(
    () => ({
      source: sourceSlug,
      status: 'all' as const,
      limit: 100,
    }),
    [sourceSlug],
  );
  const { data, loading, error, refetch } = usePredictions(filters);

  const stats = useMemo(
    () =>
      computeSourceAccuracyStats(data, {
        nameFallback: humanizeSlug(sourceSlug),
      }),
    [data, sourceSlug],
  );

  const showHeaderSkeleton = loading && data.length === 0;

  const timelinePredictions = useMemo(
    () =>
      [...data].sort(
        (a, b) =>
          new Date(b.created_at).getTime()
            - new Date(a.created_at).getTime(),
      ),
    [data],
  );

  return (
    <div className="space-y-8">
      <SourceDetailHeader
        displayName={stats.name}
        loading={showHeaderSkeleton}
      />

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="order-1 space-y-6 lg:order-2 lg:col-span-4">
          <div className="lg:sticky lg:top-8">
            <SourceStatsSidebar stats={stats} loading={showHeaderSkeleton} />
          </div>
        </div>

        <div className="order-2 space-y-6 lg:order-1 lg:col-span-8">
          {error
            ? (
                <div
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-error/35 bg-error/10 px-4 py-3 text-sm text-error"
                  role="alert"
                  aria-live="assertive"
                  aria-atomic="true"
                >
                  <span>{error}</span>
                  <button
                    type="button"
                    className="rounded-lg bg-error px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    onClick={() => void refetch()}
                  >
                    Retry
                  </button>
                </div>
              )
            : null}

          <section aria-label="Timeline">
            <SourceTimelineList
              predictions={timelinePredictions}
              loading={loading}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
