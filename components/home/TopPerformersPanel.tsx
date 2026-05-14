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
  ariaLabel,
}: {
  percent: number | null;
  /** Set when `percent` is non-null for the progressbar. */
  ariaLabel?: string;
}) {
  const width = percent === null ? 0 : Math.min(100, Math.max(0, percent));
  return (
    <div className="mt-1.5 flex items-center gap-2">
      <div
        className="h-2 min-w-0 flex-1 overflow-hidden rounded-sm bg-surface"
        {...(percent !== null && ariaLabel
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
          className="h-full rounded-sm bg-success transition-[width] duration-300"
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="w-11 shrink-0 text-right text-xs tabular-nums text-muted">
        {percent === null ? "—" : `${percent}%`}
      </span>
    </div>
  );
}

function StreakLine({ row }: { row: LeaderboardRow }) {
  if (row.streakKind === null || row.streakLength < 1) return null;
  const hot = row.streakKind === "correct";
  return (
    <p className="mt-1 text-xs text-foreground">
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
      className={`flex h-full min-h-0 flex-col rounded-xl border border-border bg-surface-elevated p-5 shadow-sm ${className}`.trim()}
    >
      {body}
    </div>
  );

  if (loading && rows.length === 0) {
    return shell(
      <>
        <h2 className="shrink-0 text-base font-semibold text-foreground">
          Leaderboard
        </h2>
        <div className="mt-4 min-h-0 flex-1">
          <div className="h-full min-h-[8rem] animate-pulse rounded-lg bg-surface" />
        </div>
      </>,
    );
  }

  if (error) {
    return (
      <div
        className={`flex h-full min-h-0 flex-col rounded-xl border border-error/35 bg-error/10 p-5 text-sm text-error ${className}`.trim()}
        role="alert"
      >
        <h2 className="shrink-0 text-base font-semibold text-foreground">
          Leaderboard
        </h2>
        <p className="mt-2 shrink-0">{error}</p>
        <div className="mt-auto flex shrink-0 pt-4">
          <button
            type="button"
            className="rounded-lg bg-error px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
        <h2 className="shrink-0 text-base font-semibold text-foreground">
          Leaderboard
        </h2>
        <p className="mt-2 shrink-0 text-sm text-muted">No sources yet.</p>
      </>,
    );
  }

  return shell(
    <>
      <div className="shrink-0">
        <h2 className="text-base font-semibold text-foreground">Leaderboard</h2>
        <p className="mt-1 text-xs text-muted">
          Ranked by constitution accuracy: correct ÷ (correct + incorrect).
        </p>
      </div>
      <ol className="mt-4 min-h-0 flex-1 list-none space-y-4 overflow-y-auto p-0">
        {rows.map((r) => {
          const slug = slugify(r.source);
          return (
            <li key={r.source} className="flex gap-3 text-sm">
              <span
                className="w-6 shrink-0 font-medium tabular-nums text-muted"
                aria-hidden
              >
                {r.rank}.
              </span>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/source/${encodeURIComponent(slug)}`}
                  className="font-medium text-foreground underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {r.source}
                </Link>
                <AccuracyMiniBar
                  percent={r.accuracyPercent}
                  ariaLabel={
                    r.accuracyPercent === null
                      ? undefined
                      : `Accuracy ${r.accuracyPercent}%: ${r.correct} correct of ${r.scored} scored (correct + incorrect)`
                  }
                />
                <p className="mt-1 text-xs text-muted">
                  {r.total} prediction{r.total === 1 ? "" : "s"}
                  {r.scored > 0 ? (
                    <span className="text-muted">
                      {" "}
                      · {r.scored} scored
                      {r.pending > 0 ? ` · ${r.pending} pending` : ""}
                      {r.outcomeUnresolved > 0
                        ? ` · ${r.outcomeUnresolved} unresolved`
                        : ""}
                      {r.invalid > 0 ? ` · ${r.invalid} invalid` : ""}
                    </span>
                  ) : r.resolved === 0 ? (
                    <span className="text-muted">
                      {" "}
                      · none with a terminal outcome
                    </span>
                  ) : (
                    <span className="text-muted">
                      {" "}
                      · {r.resolved} closed, none scored for accuracy
                      {r.pending > 0 ? ` · ${r.pending} pending` : ""}
                    </span>
                  )}
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
