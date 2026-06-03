'use client';

import type { LeaderboardRow } from '@/lib/leaderboard';
import { LeaderboardLedgerTable } from './LeaderboardLedgerTable';

export function LeaderboardFullTableLayout({ rows }: { rows: LeaderboardRow[] }) {
  return (
    <LeaderboardLedgerTable
      rows={rows}
      labelledBy="leaderboard-page-heading"
    />
  );
}
