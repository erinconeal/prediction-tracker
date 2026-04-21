"use client";

import { OUTCOMES, type Outcome } from "@/types/prediction";

export type FilterStatus = Outcome | "all";

const OUTCOME_LABELS: Record<Outcome, string> = {
  pending: "Pending",
  correct: "Correct",
  incorrect: "Incorrect",
};

/** Single source of truth for the status filter dropdown (value + visible label). */
export const STATUS_FILTER_OPTIONS: { value: FilterStatus; label: string }[] = [
  { value: "all", label: "All" },
  ...OUTCOMES.map((value) => ({ value, label: OUTCOME_LABELS[value] })),
];

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
            {STATUS_FILTER_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </fieldset>
  );
};
