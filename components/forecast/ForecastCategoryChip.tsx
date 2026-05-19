"use client";

import Link from "next/link";
import { memo } from "react";
import { categoryDisplayFromName } from "@/lib/category-display";
import { categoryTabFromName } from "@/lib/category-tabs";
import { categoryToSlug } from "@/types/category";
import { forecastCardLinkClass } from "./forecast-card-tokens";

type ForecastCategoryChipProps = {
  category: string | null | undefined;
  /** When set, uses button + callback instead of category page link. */
  onCategoryNavigate?: () => void;
  className?: string;
};

const chipButtonClass = `inline-flex min-h-11 min-w-0 max-w-full items-center gap-2.5 rounded-lg text-left ${forecastCardLinkClass}`;

const chipLinkClass =
  "inline-flex min-h-11 min-w-0 max-w-full items-center gap-2.5 rounded-lg text-left transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const chipStaticClass = "inline-flex min-w-0 max-w-full items-center gap-2.5";

export const ForecastCategoryChip = memo(function ForecastCategoryChip({
  category,
  onCategoryNavigate,
  className = "",
}: ForecastCategoryChipProps) {
  const display = categoryDisplayFromName(category);
  const tab = categoryTabFromName(category);
  const href =
    tab && tab !== "All" ? `/category/${categoryToSlug(tab)}` : undefined;

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

  if (onCategoryNavigate) {
    return (
      <button
        type="button"
        className={`${chipButtonClass} ${className}`.trim()}
        onClick={onCategoryNavigate}
        aria-label={`Browse ${tab ?? category} forecasts`}
      >
        {icon}
        {label}
      </button>
    );
  }

  if (href) {
    return (
      <Link
        href={href}
        className={`${chipLinkClass} ${className}`.trim()}
        aria-label={`Browse ${tab} forecasts`}
      >
        {icon}
        {label}
      </Link>
    );
  }

  return (
    <span className={`${chipStaticClass} ${className}`.trim()}>
      {icon}
      {label}
    </span>
  );
});
