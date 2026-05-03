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
    <fieldset
      className={`m-0 min-w-0 border-0 p-0 ${className}`.trim()}
    >
      <legend className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
        Sort by
      </legend>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {SORT_TABS.map((tab) => {
          const isActive = tab.value === value;
          return (
            <label
              key={tab.value}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-zinc-950 ${
                disabled
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer"
              } ${
                isActive
                  ? "bg-blue-600 text-white shadow-sm dark:bg-blue-600"
                  : "border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
              }`}
            >
              <input
                type="radio"
                className="sr-only"
                name="prediction-list-sort"
                value={tab.value}
                checked={isActive}
                disabled={disabled}
                onChange={() => onChange(tab.value)}
              />
              {tab.label}
            </label>
          );
        })}
      </div>
    </fieldset>
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
  }
}
