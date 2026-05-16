"use client";

import { memo, type ReactNode } from "react";
import Link from "next/link";
import { SourceAvatar } from "@/components/ui/SourceAvatar";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import type { LeaderboardRow } from "@/lib/leaderboard";
type LeaderboardSectionProps = {
  limit?: number;
  className?: string;
};

function AccuracyBar({
  percent,
  ariaLabel,
}: {
  percent: number | null;
  ariaLabel?: string;
}) {
  const width = percent === null ? 0 : Math.min(100, Math.max(0, percent));
  return (
    <div className="mt-2 flex items-center gap-3">
      <div
        className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-surface"
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
          className="h-full rounded-full bg-success transition-[width] duration-300"
          style={{ width: `${width}%` }}
        />
      </div>
      <span className="w-12 shrink-0 text-right font-mono text-sm tabular-nums text-foreground">
        {percent === null ? "—" : `${percent}%`}
      </span>
    </div>
  );
}

function FeaturedLeaderCard({ row }: { row: LeaderboardRow }) {
  const accuracy =
    row.accuracyPercent === null ? "—" : `${row.accuracyPercent}%`;

  return (
    <article className="rounded-xl border border-border bg-surface-elevated p-6 shadow-[0_4px_24px_rgb(0_0_0/0.06)]">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
        Global top rank
      </p>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
        <SourceAvatar name={row.source} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-success/15 px-2 py-0.5 font-mono text-sm font-semibold tabular-nums text-success">
              {accuracy} accuracy
            </span>
            <span className="font-mono text-xs text-muted">#{row.rank}</span>
          </div>
          <h3 className="mt-2 font-serif text-2xl font-normal tracking-tight text-foreground">
            <Link
              href={`/source/${encodeURIComponent(row.sourceSlug)}`}
              className="hover:text-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {row.source}
            </Link>
          </h3>
          <p className="mt-2 text-sm text-muted">
            {row.total} prediction{row.total === 1 ? "" : "s"} · {row.scored}{" "}
            scored
            {row.pending > 0 ? ` · ${row.pending} pending` : ""}
          </p>
          <AccuracyBar
            percent={row.accuracyPercent}
            ariaLabel={
              row.accuracyPercent === null
                ? undefined
                : `Accuracy ${row.accuracyPercent}%`
            }
          />
        </div>
      </div>
    </article>
  );
}

function RunnerUpCard({ row }: { row: LeaderboardRow }) {
  return (
    <Link
      href={`/source/${encodeURIComponent(row.sourceSlug)}`}
      className="flex items-center gap-3 rounded-lg border border-border bg-surface-elevated px-4 py-3 shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <SourceAvatar name={row.source} size="sm" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-foreground">{row.source}</p>
        <p className="text-xs text-muted">
          #{row.rank} ·{" "}
          {row.accuracyPercent === null ? "—" : `${row.accuracyPercent}%`}
        </p>
      </div>
    </Link>
  );
}

function LedgerRow({ row }: { row: LeaderboardRow }) {
  const fraction =
    row.scored > 0 ? `${row.correct}/${row.scored}` : null;

  return (
    <li className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-border px-1 py-3 last:border-b-0 sm:grid-cols-[2rem_1fr_5rem_4rem]">
      <span className="font-mono text-sm tabular-nums text-muted">
        {String(row.rank).padStart(2, "0")}
      </span>
      <div className="col-span-2 flex min-w-0 items-center gap-3 sm:col-span-1">
        <SourceAvatar name={row.source} size="sm" />
        <div className="min-w-0">
          <Link
            href={`/source/${encodeURIComponent(row.sourceSlug)}`}
            className="truncate font-medium text-foreground underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive"
          >
            {row.source}
          </Link>
          <AccuracyBar
            percent={row.accuracyPercent}
            ariaLabel={
              row.accuracyPercent === null
                ? undefined
                : `Accuracy ${row.accuracyPercent}%`
            }
          />
        </div>
      </div>
      <span className="hidden text-right font-mono text-xs tabular-nums text-muted sm:block">
        {fraction ?? "—"}
      </span>
    </li>
  );
}

export const LeaderboardSection = memo(function LeaderboardSection({
  limit = 10,
  className = "",
}: LeaderboardSectionProps) {
  const { rows, loading, error, refetch } = useLeaderboard(limit);

  const shell = (body: ReactNode) => (
    <section
      className={`space-y-6 ${className}`.trim()}
      aria-labelledby="leaderboard-heading"
    >
      <div>
        <h2
          id="leaderboard-heading"
          className="font-serif text-2xl font-normal tracking-tight text-foreground sm:text-3xl"
        >
          Top predictors
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Ranked by constitution accuracy: correct ÷ (correct + incorrect).
        </p>
      </div>
      {body}
    </section>
  );

  if (loading && rows.length === 0) {
    return shell(
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-56 animate-pulse rounded-xl bg-surface" />
        <div className="h-56 animate-pulse rounded-xl bg-surface" />
      </div>,
    );
  }

  if (error) {
    return shell(
      <div
        className="rounded-xl border border-error/35 bg-error/10 px-4 py-3 text-sm text-error"
        role="alert"
      >
        <p>{error}</p>
        <button
          type="button"
          className="mt-3 rounded-lg bg-error px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive"
          onClick={() => void refetch()}
        >
          Retry
        </button>
      </div>,
    );
  }

  if (rows.length === 0) {
    return shell(
      <p className="text-sm text-muted">No sources ranked yet.</p>,
    );
  }

  const featured = rows[0]!;
  const runnerUps = rows.slice(1, 3);
  const ledgerRows = rows.slice(3);

  return shell(
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <div className="space-y-4">
        <FeaturedLeaderCard row={featured} />
        {runnerUps.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {runnerUps.map((r) => (
              <RunnerUpCard key={r.source} row={r} />
            ))}
          </div>
        ) : null}
      </div>
      <div className="rounded-xl border border-border bg-surface-elevated px-4 py-2 shadow-sm">
        <h3 className="px-1 py-3 text-sm font-semibold text-foreground">
          Accuracy ledger
        </h3>
        <ol className="list-none p-0">
          {ledgerRows.map((r) => (
            <LedgerRow key={r.source} row={r} />
          ))}
        </ol>
      </div>
    </div>,
  );
});
