"use client";

import { memo, type ReactNode } from "react";
import Link from "next/link";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { slugify } from "@/utils/slugify";

type TopPerformersPanelProps = {
  /** Max rows to show in the rail */
  limit?: number;
  className?: string;
};

export const TopPerformersPanel = memo(function TopPerformersPanel({
  limit = 10,
  className = "",
}: TopPerformersPanelProps) {
  const { rows, loading, error, refetch } = useLeaderboard(limit);

  const shell = (body: ReactNode) => (
    <div
      className={`flex h-full min-h-0 flex-col rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`.trim()}
    >
      {body}
    </div>
  );

  if (loading && rows.length === 0) {
    return shell(
      <>
        <h2 className="shrink-0 text-base font-semibold text-zinc-900 dark:text-zinc-50">
          Leaderboard
        </h2>
        <div className="mt-4 min-h-0 flex-1">
          <div className="h-full min-h-[8rem] animate-pulse rounded-lg bg-zinc-100 dark:bg-zinc-800" />
        </div>
      </>,
    );
  }

  if (error) {
    return (
      <div
        className={`flex h-full min-h-0 flex-col rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-900 dark:border-red-800 dark:bg-red-950/60 dark:text-red-100 ${className}`.trim()}
        role="alert"
      >
        <h2 className="shrink-0 text-base font-semibold">Leaderboard</h2>
        <p className="mt-2 shrink-0">{error}</p>
        <div className="mt-auto flex shrink-0 pt-4">
          <button
            type="button"
            className="rounded-lg bg-red-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
            onClick={() => void refetch()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (rows.length === 0) {
    return shell(
      <>
        <h2 className="shrink-0 text-base font-semibold text-zinc-900 dark:text-zinc-50">
          Leaderboard
        </h2>
        <p className="mt-2 shrink-0 text-sm text-zinc-600 dark:text-zinc-300">
          No sources yet.
        </p>
      </>,
    );
  }

  return shell(
    <>
      <div className="shrink-0">
        <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          Leaderboard
        </h2>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
          Ranked by accuracy among resolved predictions.
        </p>
      </div>
      <ol className="mt-4 min-h-0 flex-1 list-none space-y-3 overflow-y-auto p-0">
        {rows.map((r) => {
          const slug = slugify(r.source);
          return (
            <li key={r.source} className="flex gap-3 text-sm">
              <span
                className="w-6 shrink-0 font-medium tabular-nums text-zinc-500 dark:text-zinc-400"
                aria-hidden
              >
                {r.rank}.
              </span>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/source/${encodeURIComponent(slug)}`}
                  className="font-medium text-zinc-900 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-zinc-50"
                >
                  {r.source}
                </Link>
                <p className="mt-0.5 text-xs text-zinc-600 dark:text-zinc-400">
                  {r.accuracyPercent === null
                    ? `— (${r.total} prediction${r.total === 1 ? "" : "s"}, none resolved)`
                    : `${r.accuracyPercent}% accuracy (${r.total} prediction${r.total === 1 ? "" : "s"})`}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </>,
  );
});
