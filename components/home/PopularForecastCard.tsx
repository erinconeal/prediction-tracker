"use client";

import Link from "next/link";
import { memo, useMemo } from "react";
import { ForecastSparkline } from "@/components/ui/ForecastSparkline";
import { SourceAvatar } from "@/components/ui/SourceAvatar";
import { categoryDisplayFromName } from "@/lib/category-display";
import {
  forecastDisplayMetricFromStats,
  trendAriaLabel,
} from "@/lib/forecast-display-metric";
import { computeSourceAccuracyStats } from "@/lib/source-stats";
import type { Prediction } from "@/types/prediction";

type PopularForecastCardProps = {
  prediction: Prediction;
  statsContext: Prediction[];
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
  className = "",
}: PopularForecastCardProps) {
  const category = categoryDisplayFromName(prediction.category);

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

  return (
    <article
      className={`flex min-h-full flex-col rounded-xl border border-border bg-surface-elevated p-5 shadow-sm transition-shadow hover:shadow-md ${className}`.trim()}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={`inline-flex size-8 shrink-0 items-center justify-center rounded-lg ${category.iconWrapClass}`}
            aria-hidden
          >
            {category.icon}
          </span>
          <span className="truncate text-xs font-semibold tracking-wide text-muted">
            {category.label}
          </span>
        </div>
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
      </div>

      <h3 className="mt-4 min-h-[3.25rem] flex-1 text-base font-semibold leading-snug text-foreground">
        <Link
          href={`/predictions/${encodeURIComponent(prediction.id)}`}
          className="line-clamp-3 hover:text-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {prediction.text}
        </Link>
      </h3>

      <div className="mt-5 flex items-end justify-between gap-3 border-t border-border/80 pt-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Source
          </p>
          <div className="mt-2 flex min-w-0 items-center gap-2">
            <SourceAvatar name={prediction.source} size="sm" />
            <Link
              href={`/source/${encodeURIComponent(prediction.sourceSlug)}`}
              className="truncate text-sm font-medium text-foreground underline-offset-2 hover:text-interactive hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {prediction.source}
            </Link>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <ForecastSparkline seed={prediction.id} trend={metric.trend} />
          <p className="max-w-[4.5rem] text-right text-xs leading-tight text-muted">
            Not live market odds
          </p>
        </div>
      </div>
    </article>
  );
});
