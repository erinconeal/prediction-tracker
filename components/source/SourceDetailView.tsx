"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { PredictionList } from "@/components/predictions/PredictionList";
import { usePredictions } from "@/hooks/usePredictions";
import { computeSourceAccuracyStats } from "@/lib/source-stats";
import { updatePredictionOutcome } from "@/services/api";
import type { TerminalOutcome } from "@/types/prediction";

type SourceDetailViewProps = {
  sourceSlug: string;
};

const statCard =
  "rounded-xl border border-border bg-surface-elevated p-4 shadow-sm";

const backLink =
  "inline-flex rounded text-sm font-medium text-interactive underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function SourceDetailView({ sourceSlug }: SourceDetailViewProps) {
  const filters = useMemo(
    () => ({
      source: sourceSlug,
      status: "all" as const,
      limit: 100,
    }),
    [sourceSlug],
  );
  const { data, loading, error, refetch } = usePredictions(filters);

  const stats = useMemo(
    () => computeSourceAccuracyStats(data, { nameFallback: sourceSlug }),
    [data, sourceSlug],
  );

  const handleOutcomeChange = useCallback(
    async (id: string, outcome: TerminalOutcome) => {
      await updatePredictionOutcome(id, outcome);
      await refetch();
    },
    [refetch],
  );

  return (
    <div className="space-y-8">
      <div>
        <Link href="/" className={backLink}>
          ← Back to dashboard
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
          {stats.name}
        </h1>
        <p className="mt-2 text-sm text-muted">
          Source slug:{" "}
          <code className="rounded bg-surface px-1.5 py-0.5 text-xs ring-1 ring-border">
            {sourceSlug}
          </code>
        </p>
      </div>

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
            {stats.accuracy === null ? "—" : `${stats.accuracy}%`}
          </p>
          <p className="mt-2 text-xs text-muted">
            Based on {stats.scored} scored (correct + incorrect).{" "}
            {stats.pending > 0 ? `${stats.pending} pending. ` : null}
            {stats.outcomeUnresolved > 0
              ? `${stats.outcomeUnresolved} unresolved. `
              : null}
            {stats.invalid > 0 ? `${stats.invalid} invalid.` : null}
          </p>
        </div>
      </div>

      {error ? (
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
      ) : null}

      <section>
        <h2 className="mb-4 text-base font-semibold text-foreground">Timeline</h2>
        <PredictionList
          predictions={[...data].sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime(),
          )}
          loading={loading}
          onOutcomeChange={handleOutcomeChange}
          emptyMessage="No predictions for this source."
        />
      </section>
    </div>
  );
}
