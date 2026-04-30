"use client";

import { useCallback, useMemo } from "react";
import Link from "next/link";
import { OutcomeBadge } from "@/components/predictions/OutcomeBadge";
import { usePrediction } from "@/hooks/usePrediction";
import { usePredictions } from "@/hooks/usePredictions";
import { computeSourceAccuracyStats } from "@/lib/source-stats";
import { updatePredictionOutcome } from "@/services/api";
import type { Outcome } from "@/types/prediction";
import { formatIsoDate, formatMonthYear } from "@/utils/format-date";

const IDLE_SOURCE = "__no_match_for_stats_idle__";

type PredictionDetailViewProps = {
  id: string;
};

export function PredictionDetailView({ id }: PredictionDetailViewProps) {
  const { prediction, loading, error, refetch: refetchPrediction } =
    usePrediction(id);

  const statsFilters = useMemo(
    () => ({
      source: prediction?.sourceSlug ?? IDLE_SOURCE,
      status: "all" as const,
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
        nameFallback: "",
        primaryName: prediction?.source ?? null,
      }),
    [sourcePredictions, prediction?.source],
  );

  const handleOutcomeChange = useCallback(
    async (outcome: Exclude<Outcome, "pending">) => {
      await updatePredictionOutcome(id, outcome);
      await refetchPrediction();
      await refetchSourceList();
    },
    [id, refetchPrediction, refetchSourceList],
  );

  if (loading && !prediction) {
    return (
      <div className="space-y-6" aria-busy="true">
        <div className="h-8 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-40 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
      </div>
    );
  }

  if (error || !prediction) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          {error ?? "Prediction not found."}
        </p>
        <Link
          href="/"
          className="mt-4 inline-block text-sm font-medium text-blue-700 underline-offset-2 hover:underline dark:text-blue-300"
        >
          Back to home
        </Link>
      </div>
    );
  }

  const p = prediction;

  return (
    <div className="space-y-10">
      <div>
        <Link
          href="/"
          className="inline-flex text-sm font-medium text-blue-700 underline-offset-2 hover:underline dark:text-blue-300"
        >
          ← Back to home
        </Link>
        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <h1 className="max-w-3xl text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {p.text}
          </h1>
          <OutcomeBadge outcome={p.outcome} className="text-sm" />
        </div>
        <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
          <Link
            href={`/source/${encodeURIComponent(p.sourceSlug)}`}
            className="font-medium text-zinc-900 underline-offset-2 hover:underline dark:text-zinc-100"
          >
            {p.source}
          </Link>
          {p.category ? (
            <>
              {" · "}
              <span>{p.category}</span>
            </>
          ) : null}
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          Timeline
        </h2>
        <ol className="m-0 list-none space-y-0 border-l-2 border-zinc-200 pl-6 dark:border-zinc-700">
          <li className="relative pb-6">
            <span className="absolute -left-[calc(0.5rem+5px)] top-1.5 h-2.5 w-2.5 rounded-full bg-blue-600 ring-4 ring-white dark:ring-zinc-950" />
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Added
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {formatIsoDate(p.created_at)}
            </p>
          </li>
          {p.target_date ? (
            <li className="relative pb-6">
              <span className="absolute -left-[calc(0.5rem+5px)] top-1.5 h-2.5 w-2.5 rounded-full bg-zinc-300 ring-4 ring-white dark:bg-zinc-600 dark:ring-zinc-950" />
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                Target
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {formatMonthYear(p.target_date)}
              </p>
            </li>
          ) : null}
          <li className="relative">
            <span className="absolute -left-[calc(0.5rem+5px)] top-1.5 h-2.5 w-2.5 rounded-full bg-zinc-300 ring-4 ring-white dark:bg-zinc-600 dark:ring-zinc-950" />
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
              Outcome
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {p.outcome === "pending"
                ? "Still open — mark correct or incorrect when the claim can be evaluated."
                : p.outcome === "correct"
                  ? "Recorded as correct against the evaluation criteria you apply for this tracker."
                  : "Recorded as incorrect against the evaluation criteria you apply for this tracker."}
            </p>
          </li>
        </ol>
      </section>

      <section className="space-y-4">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          Source stats
        </h2>
        {statsLoading && prediction ? (
          <div className="h-24 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                Total predictions
              </p>
              <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {stats.total}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                Resolved
              </p>
              <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {stats.resolved}
              </p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-600 dark:text-zinc-400">
                Accuracy
              </p>
              <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                {stats.accuracy === null ? "—" : `${stats.accuracy}%`}
              </p>
            </div>
          </div>
        )}
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          All predictions by{" "}
          <Link
            href={`/source/${encodeURIComponent(p.sourceSlug)}`}
            className="font-medium text-blue-700 underline-offset-2 hover:underline dark:text-blue-300"
          >
            {stats.name || p.source}
          </Link>
          .
        </p>
      </section>

      {p.outcome === "pending" ? (
        <section className="flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
            onClick={() => void handleOutcomeChange("correct")}
          >
            Mark correct
          </button>
          <button
            type="button"
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
            onClick={() => void handleOutcomeChange("incorrect")}
          >
            Mark incorrect
          </button>
        </section>
      ) : null}
    </div>
  );
}
