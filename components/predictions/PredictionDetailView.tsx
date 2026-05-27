'use client';

import { useCallback, useMemo } from 'react';
import Link from 'next/link';
import { OutcomeBadge } from '@/components/predictions/OutcomeBadge';
import { usePrediction } from '@/hooks/usePrediction';
import { usePredictions } from '@/hooks/usePredictions';
import { computeSourceAccuracyStats } from '@/lib/source-stats';
import { updatePredictionOutcome } from '@/services/api';
import type { TerminalOutcome } from '@/types/prediction';
import { formatIsoDate, formatMonthYear } from '@/utils/format-date';
import { useTopicCatalog } from '@/hooks/useTopicCatalog';
import { truncateWithEllipsis } from '@/utils/truncate-text';

const IDLE_SOURCE = '__no_match_for_stats_idle__';

type PredictionDetailViewProps = {
  id: string;
};

const linkBack
  = 'inline-flex text-sm font-medium text-interactive underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background';

const statCard
  = 'rounded-xl border border-border bg-surface-elevated p-4 shadow-sm';

export function PredictionDetailView({ id }: PredictionDetailViewProps) {
  const { getTopicsByIds } = useTopicCatalog();
  const { prediction, loading, error, refetch: refetchPrediction }
    = usePrediction(id);

  const statsFilters = useMemo(
    () => ({
      source: prediction?.sourceSlug ?? IDLE_SOURCE,
      status: 'all' as const,
      limit: 100,
    }),
    [prediction?.sourceSlug],
  );

  const {
    data: sourcePredictions,
    loading: statsLoading,
    refetch: refetchSourceList,
  } = usePredictions(statsFilters);

  const stats = useMemo(
    () =>
      computeSourceAccuracyStats(sourcePredictions, {
        nameFallback: '',
        primaryName: prediction?.source ?? null,
      }),
    [sourcePredictions, prediction?.source],
  );

  const handleOutcomeChange = useCallback(
    async (outcome: TerminalOutcome) => {
      await updatePredictionOutcome(id, outcome);
      await refetchPrediction();
      await refetchSourceList();
    },
    [id, refetchPrediction, refetchSourceList],
  );

  if (loading && !prediction) {
    return (
      <div className="space-y-6" aria-busy="true">
        <div className="h-8 w-48 animate-pulse rounded bg-surface" />
        <div className="h-40 animate-pulse rounded-xl bg-surface" />
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
    <div className="space-y-10">
      <div>
        <Link href="/" className={linkBack}>
          ← Back to home
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <h1 className="max-w-3xl text-2xl font-semibold tracking-tight text-foreground">
            {p.text}
          </h1>
          <OutcomeBadge outcome={p.outcome} className="text-sm" />
        </div>
        <p className="mt-3 text-sm text-muted">
          <Link
            href={`/source/${encodeURIComponent(p.sourceSlug)}`}
            className="font-medium text-foreground underline-offset-2 hover:underline"
          >
            {p.source}
          </Link>
          {p.topicIds.length > 0
            ? (
                <>
                  {' · '}
                  {getTopicsByIds(p.topicIds).map((t, i) => (
                    <span key={t.id}>
                      {i > 0 ? ', ' : null}
                      <Link
                        href={`/topics/${t.slug}`}
                        className="underline-offset-2 hover:underline"
                      >
                        {t.name}
                      </Link>
                    </span>
                  ))}
                </>
              )
            : null}
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-foreground">Timeline</h2>
        <ol className="m-0 list-none space-y-0 border-l-2 border-border pl-6">
          <li className="relative pb-6">
            <span className="absolute -left-[calc(0.5rem+5px)] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
            <p className="text-sm font-medium text-foreground">Added</p>
            <p className="text-sm text-muted">{formatIsoDate(p.created_at)}</p>
          </li>
          {p.target_date
            ? (
                <li className="relative pb-6">
                  <span className="absolute -left-[calc(0.5rem+5px)] top-1.5 h-2.5 w-2.5 rounded-full bg-border ring-4 ring-background" />
                  <p className="text-sm font-medium text-foreground">Target</p>
                  <p className="text-sm text-muted">
                    {formatMonthYear(p.target_date)}
                  </p>
                </li>
              )
            : null}
          <li className="relative">
            <span className="absolute -left-[calc(0.5rem+5px)] top-1.5 h-2.5 w-2.5 rounded-full bg-border ring-4 ring-background" />
            <p className="text-sm font-medium text-foreground">Outcome</p>
            <p className="text-sm text-muted">
              {p.outcome === 'pending'
                ? 'Still open — choose an outcome when the claim can be evaluated.'
                : p.outcome === 'correct'
                  ? 'Recorded as correct against the evaluation criteria you apply for this tracker.'
                  : p.outcome === 'incorrect'
                    ? 'Recorded as incorrect against the evaluation criteria you apply for this tracker.'
                    : p.outcome === 'unresolved'
                      ? 'Outcome could not be determined with confidence (see constitution, section 6.3).'
                      : 'Excluded from scoring: failed inclusion or resolution criteria (see constitution, sections 6.3 and 7.3).'}
            </p>
          </li>
        </ol>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-foreground">Source stats</h2>
        {statsLoading && prediction
          ? (
              <div className="h-24 animate-pulse rounded-xl bg-surface" />
            )
          : (
              <div className="grid gap-4 sm:grid-cols-3">
                <div className={statCard}>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">
                    Total predictions
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">
                    {stats.total}
                  </p>
                </div>
                <div className={statCard}>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">
                    Resolved
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">
                    {stats.resolved}
                  </p>
                </div>
                <div className={statCard}>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">
                    Accuracy
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">
                    {stats.accuracy === null ? '—' : `${stats.accuracy}%`}
                  </p>
                  <p className="mt-2 text-xs text-muted">
                    Based on
                    {' '}
                    {stats.scored}
                    {' '}
                    scored (correct + incorrect).
                    {stats.pending > 0 ? ` ${stats.pending} pending.` : ''}
                    {stats.outcomeUnresolved > 0
                      ? ` ${stats.outcomeUnresolved} unresolved.`
                      : ''}
                    {stats.invalid > 0 ? ` ${stats.invalid} invalid.` : ''}
                  </p>
                </div>
              </div>
            )}
        <p className="text-sm text-muted">
          All predictions by
          {' '}
          <Link
            href={`/source/${encodeURIComponent(p.sourceSlug)}`}
            className="font-medium text-interactive underline-offset-2 hover:underline"
          >
            {stats.name || p.source}
          </Link>
          .
        </p>
      </section>

      {p.outcome === 'pending'
        ? (
            <section className="flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-lg bg-success px-4 py-2 text-sm font-medium text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label={`Mark as correct: ${truncateWithEllipsis(p.text, 80)}`}
                onClick={() => void handleOutcomeChange('correct')}
              >
                Mark correct
              </button>
              <button
                type="button"
                className="rounded-lg bg-error px-4 py-2 text-sm font-medium text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label={`Mark as incorrect: ${truncateWithEllipsis(p.text, 80)}`}
                onClick={() => void handleOutcomeChange('incorrect')}
              >
                Mark incorrect
              </button>
              <button
                type="button"
                className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label={`Mark as unresolved: ${truncateWithEllipsis(p.text, 80)}`}
                onClick={() => void handleOutcomeChange('unresolved')}
              >
                Mark unresolved
              </button>
              <button
                type="button"
                className="rounded-lg border border-border bg-surface-elevated px-4 py-2 text-sm font-medium text-foreground hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label={`Mark as invalid: ${truncateWithEllipsis(p.text, 80)}`}
                onClick={() => void handleOutcomeChange('invalid')}
              >
                Mark invalid
              </button>
            </section>
          )
        : null}
    </div>
  );
}
