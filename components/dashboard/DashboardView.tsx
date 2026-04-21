"use client";

import { useCallback, useMemo, useState } from "react";
import { DashboardCharts } from "@/components/charts/DashboardCharts";
import { AccuracySummary } from "@/components/dashboard/AccuracySummary";
import { PredictionForm } from "@/components/predictions/PredictionForm";
import {
  PredictionFilters,
  type FilterStatus,
} from "@/components/predictions/PredictionFilters";
import { PredictionList } from "@/components/predictions/PredictionList";
import { usePredictions } from "@/hooks/usePredictions";
import {
  createPrediction,
  updatePredictionOutcome,
} from "@/services/api";
import type { CreatePredictionInput, Outcome } from "@/types/prediction";

export function DashboardView() {
  const [sourceInput, setSourceInput] = useState("");
  const [status, setStatus] = useState<FilterStatus>("all");
  const filters = useMemo(
    () => ({
      source: sourceInput.trim() || undefined,
      status,
    }),
    [sourceInput, status],
  );
  const { data, loading, error, refetch } = usePredictions(filters);

  const handleCreate = useCallback(
    async (input: CreatePredictionInput) => {
      await createPrediction(input);
      await refetch();
    },
    [refetch],
  );

  const handleOutcomeChange = useCallback(
    async (id: string, outcome: Exclude<Outcome, "pending">) => {
      await updatePredictionOutcome(id, outcome);
      await refetch();
    },
    [refetch],
  );

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">
          Track public predictions, resolve outcomes, and compare accuracy across
          sources.
        </p>
      </div>

      <PredictionForm onSubmit={handleCreate} disabled={loading} />

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          Filters
        </h2>
        <PredictionFilters
          source={sourceInput}
          onSourceChange={setSourceInput}
          status={status}
          onStatusChange={setStatus}
          disabled={loading}
        />
      </section>

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

      <AccuracySummary predictions={data} />

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          Trends
        </h2>
        <DashboardCharts predictions={data} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
            Predictions
          </h2>
          {loading && data.length > 0 ? (
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              Updating…
            </span>
          ) : null}
        </div>
        <PredictionList
          predictions={data}
          loading={loading}
          onOutcomeChange={handleOutcomeChange}
        />
      </section>
    </div>
  );
}
