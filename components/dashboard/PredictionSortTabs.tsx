"use client";

import { memo } from "react";
import type { PredictionListSort } from "@/types/prediction";

const SORT_TABS: { value: PredictionListSort; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "source_accuracy", label: "Most accurate source" },
  { value: "recently_resolved", label: "Recently resolved" },
];

type PredictionSortTabsProps = {
  value: PredictionListSort;
  onChange: (sort: PredictionListSort) => void;
  disabled?: boolean;
  className?: string;
};

export const PredictionSortTabs = memo(function PredictionSortTabs({
  value,
  onChange,
  disabled = false,
  className = "",
}: PredictionSortTabsProps) {
  return (
    <div
      className={`flex flex-col gap-1.5 ${className}`.trim()}
      role="tablist"
      aria-label="Sort predictions"
    >
      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
        Sort by
      </span>
      <div className="flex flex-wrap gap-2">
        {SORT_TABS.map((tab) => {
          const isActive = tab.value === value;
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              disabled={disabled}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 dark:focus-visible:ring-offset-zinc-950 ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm dark:bg-blue-600"
                  : "border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
              }`}
              onClick={() => onChange(tab.value)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
});

export function sortSubtitle(sort: PredictionListSort): string {
  switch (sort) {
    case "newest":
      return "Newest first. Open a card for timeline and source stats.";
    case "source_accuracy":
      return "Higher resolved accuracy per source first. Open a card for details.";
    case "recently_resolved":
      return "Recently resolved first, then newest pending. Open a card for details.";
    default:
      return "";
  }
}
