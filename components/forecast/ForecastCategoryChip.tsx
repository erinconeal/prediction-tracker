"use client";

import { memo } from "react";
import { categoryDisplayFromName } from "@/lib/category-display";
import { topicTabFromCategory } from "@/lib/topic-tabs";
import type { TopicTab } from "@/lib/topic-tabs";
import { forecastCardLinkClass } from "./forecast-card-tokens";

type ForecastCategoryChipProps = {
  category: string | null | undefined;
  onCategorySelect?: (tab: TopicTab) => void;
  className?: string;
};

const chipButtonClass = `inline-flex min-h-11 min-w-0 max-w-full items-center gap-2.5 rounded-lg text-left ${forecastCardLinkClass}`;

const chipStaticClass = "inline-flex min-w-0 max-w-full items-center gap-2.5";

export const ForecastCategoryChip = memo(function ForecastCategoryChip({
  category,
  onCategorySelect,
  className = "",
}: ForecastCategoryChipProps) {
  const display = categoryDisplayFromName(category);
  const topicTab = topicTabFromCategory(category);
  const canFilter = topicTab !== undefined && onCategorySelect !== undefined;

  const icon = (
    <span
      className={`inline-flex size-8 shrink-0 items-center justify-center rounded-lg ${display.iconWrapClass}`}
      aria-hidden
    >
      {display.icon}
    </span>
  );

  const label = (
    <span className="truncate text-xs font-semibold tracking-wide text-muted">
      {display.label}
    </span>
  );

  if (canFilter) {
    return (
      <button
        type="button"
        className={`${chipButtonClass} ${className}`.trim()}
        onClick={() => onCategorySelect(topicTab)}
        aria-label={`Browse ${topicTab} forecasts`}
      >
        {icon}
        {label}
      </button>
    );
  }

  return (
    <span className={`${chipStaticClass} ${className}`.trim()}>
      {icon}
      {label}
    </span>
  );
});
