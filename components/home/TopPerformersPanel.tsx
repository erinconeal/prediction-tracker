"use client";

import { memo, type ReactNode } from "react";
import Link from "next/link";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import type { LeaderboardRow } from "@/lib/leaderboard";
import { slugify } from "@/utils/slugify";

type TopPerformersPanelProps = {
  /** Max rows to show in the rail */
  limit?: number;
  className?: string;
};

function AccuracyMiniBar({
  percent,
  resolved,
  total,
}: {
  percent: number | null;
  resolved: number;
  total: number;
}) {
  const width = percent === null ? 0 : Math.min(100, Math.max(0, percent));
  const ariaLabel =
    percent === null
      ? undefined
      : resolved < total
        ? `Accuracy ${percent}% (${resolved} of ${total} predictions resolved)`
        : `Accuracy ${percent}% (${resolved} resolved)`;
  return (
    <div className="mt-1.5 flex items-center gap-2">
      <div
        className="h-2 min-w-0 flex-1 overflow-hidden rounded-sm bg-zinc-200 dark:bg-zinc-700"
        {...(percent !== null
          ? {
              role: "progressbar" as const,
              "aria-valuenow": Math.round(percent),
              "aria-valuemin": 0,
              "aria-valuemax": 100,
              "aria-label": ariaLabel,
            }
          : { "aria-hidden": true as const })}
      >
        <div
          className="h-full rounded-sm bg-emerald-600 transition-[width] duration-300 dark:bg-emerald-500"
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="w-11 shrink-0 text-right text-xs tabular-nums text-zinc-600 dark:text-zinc-400">
        {percent === null ? "—" : `${percent}%`}
      </span>
    </div>
  );
}

function StreakLine({ row }: { row: LeaderboardRow }) {
  if (row.streakKind === null || row.streakLength < 1) return null;
  const hot = row.streakKind === "correct";
  return (
    <p className="mt-1 text-xs text-zinc-700 dark:text-zinc-200">
      <span aria-hidden>{hot ? "🔥" : "❄️"}</span>{" "}
      <span className="font-medium tabular-nums">{row.streakLength}</span>
      {hot ? " correct" : " incorrect"} in a row
    </p>
  );
}

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
      <ol className="mt-4 min-h-0 flex-1 list-none space-y-4 overflow-y-auto p-0">
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
                <AccuracyMiniBar
                  percent={r.accuracyPercent}
                  resolved={r.resolved}
                  total={r.total}
                />
                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                  {r.total} prediction{r.total === 1 ? "" : "s"}
                  {r.resolved === 0 ? (
                    <span className="text-zinc-500 dark:text-zinc-500">
                      {" "}
                      · none resolved
                    </span>
                  ) : r.resolved < r.total ? (
                    <span className="text-zinc-500 dark:text-zinc-500">
                      {" "}
                      · {r.resolved} of {r.total} resolved
                    </span>
                  ) : null}
                </p>
                <StreakLine row={r} />
              </div>
            </li>
          );
        })}
      </ol>
    </>,
  );
});
