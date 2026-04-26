"use client";

import { useMemo } from "react";
import { DashboardChartsInner } from "@/components/charts/DashboardChartsInner";
import {
  buildAccuracyOverTime,
  buildOutcomeSplit,
  buildPerSourceCounts,
} from "@/components/charts/chart-data";
import type { Prediction } from "@/types/prediction";

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
