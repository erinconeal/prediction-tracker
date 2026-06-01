'use client';

import { ListOrdered, Trophy } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { SourceAccuracyBadge } from '@/components/forecast/SourceAccuracyBadge';
import { SourceAvatar } from '@/components/ui/SourceAvatar';
import { forecastDisplayMetricFromAccuracyPercent } from '@/lib/forecast-display-metric';
import type { LeaderboardRow } from '@/lib/leaderboard';
import { formatLeaderboardAccuracyContext } from '@/lib/leaderboard-row-context';
import { LEADERBOARD_RUNNER_UP_CARD_MIN_ROWS } from '@/lib/leaderboard-display';
import { LeaderboardAccuracyBar } from './LeaderboardAccuracyBar';
import { LeaderboardRankBadge } from './LeaderboardRankBadge';
import { LeaderboardStreakBadge } from './LeaderboardStreakBadge';

function LedgerPanel({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-md border border-border bg-surface-elevated px-4 py-2">
      {title
        ? (
            <h3 className="flex items-center gap-2 px-1 py-3 text-sm font-semibold text-foreground">
              <ListOrdered className="size-4 shrink-0 text-interactive" aria-hidden />
              {title}
            </h3>
          )
        : null}
      <ol className="list-none p-0">{children}</ol>
    </div>
  );
}

function LedgerRow({
  row,
  highlighted = false,
}: {
  row: LeaderboardRow;
  highlighted?: boolean;
}) {
  const fraction
    = row.scored > 0 ? `${row.correct}/${row.scored}` : null;
  const accuracyLabel
    = row.accuracyPercent === null
      ? undefined
      : `Accuracy ${row.accuracyPercent}%`;
  const metric = forecastDisplayMetricFromAccuracyPercent(row.accuracyPercent);
  const contextLine = formatLeaderboardAccuracyContext(row);

  return (
    <li
      className={
        highlighted
          ? 'border-b border-border border-l-4 border-l-primary bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-3 py-4 last:border-b-0'
          : 'grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-border px-1 py-3 transition-colors last:border-b-0 hover:bg-interactive/5 sm:grid-cols-[2rem_1fr_5rem_4rem]'
      }
    >
      {highlighted
        ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <SourceAvatar name={row.source} size="lg" />
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                  <Trophy className="size-3.5" aria-hidden />
                  Leading source
                </p>
                <div className="mt-2">
                  <SourceAccuracyBadge metric={metric} />
                </div>
                <h3 className="mt-1 font-serif text-xl font-normal tracking-tight text-foreground">
                  <Link
                    href={`/source/${encodeURIComponent(row.sourceSlug)}`}
                    className="hover:text-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    {row.source}
                  </Link>
                </h3>
                <p className="mt-1 text-sm text-muted">{contextLine}</p>
                <LeaderboardStreakBadge row={row} />
                <LeaderboardAccuracyBar percent={row.accuracyPercent} ariaLabel={accuracyLabel} />
              </div>
            </div>
          )
        : (
            <>
              <div className="flex w-10 shrink-0 justify-center sm:w-8">
                <LeaderboardRankBadge rank={row.rank} />
              </div>
              <div className="col-span-2 flex min-w-0 items-center gap-3 sm:col-span-1">
                <SourceAvatar name={row.source} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/source/${encodeURIComponent(row.sourceSlug)}`}
                      className="truncate font-medium text-foreground underline-offset-2 hover:text-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive"
                    >
                      {row.source}
                    </Link>
                    <SourceAccuracyBadge metric={metric} />
                  </div>
                  <p className="mt-0.5 text-xs text-muted">{contextLine}</p>
                  <LeaderboardStreakBadge row={row} />
                  <LeaderboardAccuracyBar
                    percent={row.accuracyPercent}
                    ariaLabel={accuracyLabel}
                    compact
                  />
                </div>
              </div>
              <span className="hidden text-right font-mono text-xs font-medium tabular-nums text-ink sm:block">
                {fraction ?? '—'}
              </span>
            </>
          )}
    </li>
  );
}

function RunnerUpCard({ row }: { row: LeaderboardRow }) {
  const borderAccent
    = row.rank === 2
      ? 'border-interactive/30 hover:bg-interactive/5'
      : 'border-accent-attention/30 hover:bg-accent-attention/5';
  const metric = forecastDisplayMetricFromAccuracyPercent(row.accuracyPercent);

  return (
    <Link
      href={`/source/${encodeURIComponent(row.sourceSlug)}`}
      className={`flex items-center gap-3 rounded-md border bg-surface px-4 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background ${borderAccent}`}
    >
      <SourceAvatar name={row.source} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate font-medium text-foreground">{row.source}</p>
          <LeaderboardRankBadge rank={row.rank} />
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
          <SourceAccuracyBadge metric={metric} />
        </p>
        <p className="mt-0.5 text-xs text-muted">
          {formatLeaderboardAccuracyContext(row)}
        </p>
        <LeaderboardStreakBadge row={row} />
      </div>
    </Link>
  );
}

export function FullLeaderboard({ rows }: { rows: LeaderboardRow[] }) {
  const useSplitLayout = rows.length >= LEADERBOARD_RUNNER_UP_CARD_MIN_ROWS;
  const featured = rows[0]!;
  const runnerUps = rows.slice(1, 3);
  const ledgerTail = rows.slice(3);

  if (!useSplitLayout) {
    return (
      <LedgerPanel>
        {rows.map(r => (
          <LedgerRow
            key={r.sourceSlug}
            row={r}
            highlighted={r.rank === 1}
          />
        ))}
      </LedgerPanel>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <div className="space-y-3">
        <LedgerPanel>
          <LedgerRow row={featured} highlighted />
        </LedgerPanel>
        {runnerUps.length > 0
          ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {runnerUps.map(r => (
                  <RunnerUpCard key={r.sourceSlug} row={r} />
                ))}
              </div>
            )
          : null}
      </div>
      {ledgerTail.length > 0
        ? (
            <LedgerPanel title="Accuracy ledger">
              {ledgerTail.map(r => (
                <LedgerRow key={r.sourceSlug} row={r} />
              ))}
            </LedgerPanel>
          )
        : null}
    </div>
  );
}
