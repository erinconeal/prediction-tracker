"use client";

import { memo, useMemo } from "react";
import { ForecastCardFooter } from "@/components/forecast/ForecastCardFooter";
import { ForecastCardShell } from "@/components/forecast/ForecastCardShell";
import { ForecastCardTitle } from "@/components/forecast/ForecastCardTitle";
import { ForecastCategoryChip } from "@/components/forecast/ForecastCategoryChip";
import { ForecastSparkline } from "@/components/ui/ForecastSparkline";
import {
  forecastDisplayMetricFromStats,
  trendAriaLabel,
} from "@/lib/forecast-display-metric";
import { computeSourceAccuracyStats } from "@/lib/source-stats";
import { categoryTabFromName, type CategoryTab } from "@/lib/category-tabs";
import type { Prediction } from "@/types/prediction";

type PopularForecastCardProps = {
  prediction: Prediction;
  statsContext: Prediction[];
  onCategorySelect?: (tab: CategoryTab) => void;
  className?: string;
};

const BADGE_CLASS = {
  up: "bg-success/12 text-success",
  down: "bg-error/12 text-error",
  flat: "bg-warning/15 text-warning",
} as const;

const TREND_SYMBOL = {
  up: "↑",
  down: "↓",
  flat: "—",
} as const;

export const PopularForecastCard = memo(function PopularForecastCard({
  prediction,
  statsContext,
  onCategorySelect,
  className = "",
}: PopularForecastCardProps) {
  const stats = useMemo(
    () =>
      computeSourceAccuracyStats(
        statsContext.filter((p) => p.sourceSlug === prediction.sourceSlug),
        {
          nameFallback: prediction.sourceSlug,
          primaryName: prediction.source,
        },
      ),
    [statsContext, prediction.sourceSlug, prediction.source],
  );

  const categoryTab = categoryTabFromName(prediction.category);
  const metric = forecastDisplayMetricFromStats(stats);
  const badgeClass = BADGE_CLASS[metric.trend];
  const badgeText =
    metric.percent === null
      ? `— ${TREND_SYMBOL[metric.trend]}`
      : `${metric.percent}% ${TREND_SYMBOL[metric.trend]}`;

  const metricAria =
    metric.percent === null
      ? `Source accuracy unavailable, ${trendAriaLabel(metric.trend)}`
      : `Source accuracy ${metric.percent} percent, ${trendAriaLabel(metric.trend)}`;

  const trackRecordCorner = (
    <div className="flex shrink-0 flex-col items-end gap-0.5 text-right">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">
        Track record
      </span>
      <span
        className={`inline-flex items-center gap-0.5 rounded-full px-2.5 py-1 font-mono text-xs font-semibold tabular-nums ${badgeClass}`}
        aria-label={metricAria}
      >
        <span aria-hidden>{badgeText}</span>
      </span>
    </div>
  );

  const sparklineEnd = (
    <div className="flex flex-col items-end gap-1">
      <ForecastSparkline seed={prediction.id} trend={metric.trend} />
      <p className="max-w-[4.5rem] text-right text-xs leading-tight text-muted">
        Not live market odds
      </p>
    </div>
  );

  return (
    <ForecastCardShell
      className={className}
      headerStart={
        <ForecastCategoryChip
          category={prediction.category}
          onCategoryNavigate={
            onCategorySelect && categoryTab
              ? () => onCategorySelect(categoryTab)
              : undefined
          }
        />
      }
      headerEnd={trackRecordCorner}
      title={
        <ForecastCardTitle
          predictionId={prediction.id}
          text={prediction.text}
        />
      }
      footer={
        <ForecastCardFooter
          sourceName={prediction.source}
          sourceSlug={prediction.sourceSlug}
          endSlot={sparklineEnd}
        />
      }
    />
  );
});
