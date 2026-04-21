"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";
import {
  buildAccuracyOverTime,
  buildOutcomeSplit,
  buildPerSourceCounts,
} from "@/components/charts/chart-data";
import type { Prediction } from "@/types/prediction";

const DashboardChartsInner = dynamic(
  () =>
    import("@/components/charts/DashboardChartsInner").then((m) => m.DashboardChartsInner),
  {
    ssr: false,
    loading: () => (
      <div className="grid gap-8 lg:grid-cols-2" aria-hidden>
        <div className="h-72 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-72 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800" />
        <div className="h-72 animate-pulse rounded-xl bg-zinc-100 dark:bg-zinc-800 lg:col-span-2" />
      </div>
    ),
  },
);

type DashboardChartsProps = {
  predictions: Prediction[];
};

export function DashboardCharts({ predictions }: DashboardChartsProps) {
  const accuracyOverTime = useMemo(
    () => buildAccuracyOverTime(predictions),
    [predictions],
  );
  const perSource = useMemo(
    () => buildPerSourceCounts(predictions),
    [predictions],
  );
  const outcomeSplit = useMemo(
    () => buildOutcomeSplit(predictions),
    [predictions],
  );

  return (
    <DashboardChartsInner
      accuracyOverTime={accuracyOverTime}
      perSource={perSource}
      outcomeSplit={outcomeSplit}
    />
  );
}
