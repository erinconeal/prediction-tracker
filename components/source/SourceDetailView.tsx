"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { PredictionList } from "@/components/predictions/PredictionList";
import { usePredictions } from "@/hooks/usePredictions";
import { updatePredictionOutcome } from "@/services/api";
import type { Outcome } from "@/types/prediction";

type SourceDetailViewProps = {
  sourceSlug: string;
};

export function SourceDetailView({ sourceSlug }: SourceDetailViewProps) {
  const filters = useMemo(
    () => ({ source: sourceSlug, status: "all" as const }),
    [sourceSlug],
  );
  const { data, loading, error, refetch } = usePredictions(filters);

  const stats = useMemo(() => {
    let resolved = 0;
    let correct = 0;
    const name = data[0]?.source ?? sourceSlug;
    for (const p of data) {
      if (p.outcome === "pending") continue;
      resolved += 1;
      if (p.outcome === "correct") correct += 1;
    }
    const accuracy =
      resolved === 0 ? null : Math.round((correct / resolved) * 1000) / 10;
    return { name, total: data.length, resolved, accuracy };
  }, [data, sourceSlug]);

  const handleOutcomeChange = useCallback(
    async (id: string, outcome: Exclude<Outcome, "pending">) => {
      await updatePredictionOutcome(id, outcome);
      await refetch();
    },
    [refetch],
  );

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
        >
          ← Back to dashboard
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {stats.name}
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Source slug:{" "}
          <code className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
            {sourceSlug}
          </code>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Total predictions
          </p>
          <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {stats.total}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Resolved
          </p>
          <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {stats.resolved}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Accuracy
          </p>
          <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            {stats.accuracy === null ? "—" : `${stats.accuracy}%`}
          </p>
        </div>
      </div>

      {error ? (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200"
          role="alert"
        >
          <span>{error}</span>
          <button
            type="button"
            className="rounded-lg bg-red-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-800 dark:bg-red-200 dark:text-red-950 dark:hover:bg-white"
            onClick={() => void refetch()}
          >
            Retry
          </button>
        </div>
      ) : null}

      <section>
        <h2 className="mb-4 text-base font-semibold text-zinc-900 dark:text-zinc-50">
          Timeline
        </h2>
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
