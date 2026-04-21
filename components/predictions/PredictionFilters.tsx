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

export const PredictionFilters = ({
  source,
  onSourceChange,
  status,
  onStatusChange,
  disabled,
}: PredictionFiltersProps) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <label className="block flex-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Filter by source
        <input
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400/30 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50"
          value={source}
          onChange={(e) => onSourceChange(e.target.value)}
          disabled={disabled}
          placeholder="Name or slug; leave empty for all"
          autoComplete="off"
        />
      </label>
      <label className="block w-full text-sm font-medium text-zinc-700 sm:w-48 dark:text-zinc-300">
        Status
        <select
          className="mt-1 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400/30 dark:border-zinc-600 dark:bg-zinc-950 dark:text-zinc-50"
          value={status}
          onChange={(e) => onStatusChange(e.target.value as FilterStatus)}
          disabled={disabled}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="correct">Correct</option>
          <option value="incorrect">Incorrect</option>
        </select>
      </label>
    </div>
  );
};
