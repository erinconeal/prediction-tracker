"use client";

import type { Outcome } from "@/types/prediction";

export type FilterStatus = Outcome | "all";

type PredictionFiltersProps = {
  source: string;
  onSourceChange: (value: string) => void;
  status: FilterStatus;
  onStatusChange: (value: FilterStatus) => void;
  disabled?: boolean;
};

const sourceFilterId = "prediction-filter-source";
const statusFilterId = "prediction-filter-status";

export const PredictionFilters = ({
  source,
  onSourceChange,
  status,
  onStatusChange,
  disabled,
}: PredictionFiltersProps) => {
  return (
    <fieldset className="min-w-0 border-0 p-0">
      <legend className="sr-only">Filter predictions</legend>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="block min-w-0 flex-1">
          <label
            htmlFor={sourceFilterId}
            className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
          >
            Filter by source
          </label>
          <input
            id={sourceFilterId}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus-visible:border-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/50 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50"
            value={source}
            onChange={(e) => onSourceChange(e.target.value)}
            disabled={disabled}
            placeholder="Name or slug; leave empty for all"
            autoComplete="off"
          />
        </div>
        <div className="block w-full sm:w-48">
          <label
            htmlFor={statusFilterId}
            className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
          >
            Status
          </label>
          <select
            id={statusFilterId}
            className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus-visible:border-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/50 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50"
            value={status}
            onChange={(e) => onStatusChange(e.target.value as FilterStatus)}
            disabled={disabled}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="correct">Correct</option>
            <option value="incorrect">Incorrect</option>
          </select>
        </div>
      </div>
    </fieldset>
  );
};
