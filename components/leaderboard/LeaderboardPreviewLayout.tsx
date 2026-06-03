'use client';

import { ListOrdered } from 'lucide-react';
import type { LeaderboardRow } from '@/lib/leaderboard';
import { LEADERBOARD_RUNNER_UP_CARD_MIN_ROWS } from '@/lib/leaderboard-display';
import { LeaderboardFeaturedSource } from './LeaderboardFeaturedSource';
import { LeaderboardLedgerTable } from './LeaderboardLedgerTable';
import { LeaderboardRunnerUpCard } from './LeaderboardRunnerUpCard';

export function LeaderboardPreviewLayout({ rows }: { rows: LeaderboardRow[] }) {
  const useSplitLayout = rows.length >= LEADERBOARD_RUNNER_UP_CARD_MIN_ROWS;
  const featured = rows[0]!;
  const runnerUps = rows.slice(1, 3);
  const ledgerTail = rows.slice(3);

  if (!useSplitLayout) {
    return (
      <LeaderboardLedgerTable
        rows={rows}
        caption="Top predictors ranked by accuracy"
      />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
      <div className="space-y-3">
        <LeaderboardFeaturedSource row={featured} />
        {runnerUps.length > 0
          ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {runnerUps.map(r => (
                  <LeaderboardRunnerUpCard key={r.sourceSlug} row={r} />
                ))}
              </div>
            )
          : null}
      </div>
      {ledgerTail.length > 0
        ? (
            <div className="space-y-2">
              <h3
                id="leaderboard-ledger-heading"
                className="flex items-center gap-2 text-sm font-semibold text-foreground"
              >
                <ListOrdered className="size-4 shrink-0 text-interactive" aria-hidden />
                Accuracy ledger
              </h3>
              <LeaderboardLedgerTable
                rows={ledgerTail}
                labelledBy="leaderboard-ledger-heading"
              />
            </div>
          )
        : null}
    </div>
  );
}
