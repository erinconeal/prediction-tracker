'use client';

import Link from 'next/link';
import { SourceAccuracyBadge } from '@/components/forecast/SourceAccuracyBadge';
import { SourceAvatar } from '@/components/ui/SourceAvatar';
import { forecastDisplayMetricFromAccuracyPercent } from '@/lib/forecast-display-metric';
import type { LeaderboardRow } from '@/lib/leaderboard';
import { LeaderboardRankBadge } from '@/components/home/leaderboard/LeaderboardRankBadge';
import { LeaderboardTrendGlyph } from './LeaderboardTrendGlyph';

function LedgerTableRow({ row }: { row: LeaderboardRow }) {
  const metric = forecastDisplayMetricFromAccuracyPercent(row.accuracyPercent);
  const fraction
    = row.scored > 0 ? `${row.correct}/${row.scored}` : '—';

  return (
    <tr className="border-b border-border last:border-b-0 hover:bg-interactive/5">
      <td className="w-14 px-3 py-3 align-middle">
        <LeaderboardRankBadge rank={row.rank} />
      </td>
      <td className="px-3 py-3 align-middle">
        <div className="flex min-w-0 items-center gap-3">
          <SourceAvatar name={row.source} size="sm" />
          <Link
            href={`/source/${encodeURIComponent(row.sourceSlug)}`}
            className="truncate font-medium text-foreground underline-offset-2 hover:text-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive"
          >
            {row.source}
          </Link>
        </div>
      </td>
      <td className="hidden px-3 py-3 align-middle sm:table-cell">
        <SourceAccuracyBadge metric={metric} />
      </td>
      <td className="px-3 py-3 text-right align-middle font-mono text-sm tabular-nums text-ink">
        {fraction}
      </td>
      <td className="hidden w-14 px-3 py-3 text-center align-middle md:table-cell">
        <LeaderboardTrendGlyph accuracyPercent={row.accuracyPercent} />
      </td>
    </tr>
  );
}

function LedgerMobileRow({ row }: { row: LeaderboardRow }) {
  const metric = forecastDisplayMetricFromAccuracyPercent(row.accuracyPercent);
  const fraction
    = row.scored > 0 ? `${row.correct}/${row.scored}` : '—';

  return (
    <li className="border-b border-border px-3 py-3 last:border-b-0 sm:hidden">
      <div className="flex items-start gap-3">
        <LeaderboardRankBadge rank={row.rank} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <SourceAvatar name={row.source} size="sm" />
            <Link
              href={`/source/${encodeURIComponent(row.sourceSlug)}`}
              className="truncate font-medium text-foreground hover:text-interactive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive"
            >
              {row.source}
            </Link>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <SourceAccuracyBadge metric={metric} />
            <span className="font-mono text-xs tabular-nums text-muted">
              {fraction}
            </span>
            <LeaderboardTrendGlyph accuracyPercent={row.accuracyPercent} />
          </div>
        </div>
      </div>
    </li>
  );
}

type LeaderboardLedgerTableProps = {
  rows: LeaderboardRow[];
  caption?: string;
  labelledBy?: string;
};

export function LeaderboardLedgerTable({
  rows,
  caption,
  labelledBy,
}: LeaderboardLedgerTableProps) {
  if (rows.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-md border border-border bg-surface-elevated">
      <ul className="list-none p-0 sm:hidden">
        {rows.map(row => (
          <LedgerMobileRow key={row.sourceSlug} row={row} />
        ))}
      </ul>
      <table
        className="hidden w-full min-w-[32rem] border-collapse text-left sm:table"
        {...(labelledBy
          ? { 'aria-labelledby': labelledBy }
          : caption
            ? {}
            : { 'aria-label': 'Leaderboard rankings' })}
      >
        {caption
          ? (
              <caption className="sr-only">{caption}</caption>
            )
          : null}
        <thead className="border-b border-border bg-surface">
          <tr className="text-xs font-semibold uppercase tracking-wide text-muted">
            <th scope="col" className="px-3 py-3">
              Rank
            </th>
            <th scope="col" className="px-3 py-3">
              Source
            </th>
            <th scope="col" className="hidden px-3 py-3 sm:table-cell">
              Accuracy
            </th>
            <th scope="col" className="px-3 py-3 text-right">
              Scored
            </th>
            <th scope="col" className="hidden px-3 py-3 text-center md:table-cell">
              Trend
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <LedgerTableRow key={row.sourceSlug} row={row} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
