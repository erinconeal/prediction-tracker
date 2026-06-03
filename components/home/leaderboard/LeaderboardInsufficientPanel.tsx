'use client';

import { BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { SourceAvatar } from '@/components/ui/SourceAvatar';
import type { LeaderboardRow } from '@/lib/leaderboard';
import {
  insufficientLeaderboardMessage,
  leaderboardDisplayStats,
  sourcesByScoredVolume,
  type LeaderboardDisplayStats,
} from '@/lib/leaderboard-display';

export function LeaderboardInsufficientPanel({
  rows,
  displayStats,
}: {
  rows: LeaderboardRow[];
  displayStats?: LeaderboardDisplayStats;
}) {
  const stats = displayStats ?? leaderboardDisplayStats(rows);
  const preview = sourcesByScoredVolume(rows);

  return (
    <div className="rounded-md border border-interactive/25 bg-interactive/5 px-4 py-5">
      {preview.length > 0
        ? (
            <ul className="list-none space-y-2 p-0">
              {preview.map(r => (
                <li key={r.sourceSlug}>
                  <Link
                    href={`/source/${encodeURIComponent(r.sourceSlug)}`}
                    aria-label={`${r.source}, ${r.correct} of ${r.scored} scored`}
                    className="flex items-center justify-between gap-3 rounded-md border border-transparent px-2 py-2 transition-colors hover:border-interactive/20 hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <SourceAvatar name={r.source} size="sm" />
                      <span className="truncate font-medium text-foreground">
                        {r.source}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-full bg-primary/12 px-2 py-0.5 font-mono text-xs font-semibold tabular-nums text-primary">
                      {r.correct}
                      /
                      {r.scored}
                      {' '}
                      scored
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )
        : (
            <p className="mt-3 text-sm text-muted">
              No scored predictions yet.
            </p>
          )}
      <p className="mt-3 flex items-start gap-2 text-sm text-foreground">
        <BarChart3
          className="mt-0.5 size-4 shrink-0 text-interactive"
          aria-hidden
        />
        <span>{insufficientLeaderboardMessage(stats)}</span>
      </p>
      <p className="mt-2 text-sm text-muted">
        Track records are still building. Sources with the most scored
        predictions so far:
      </p>
    </div>
  );
}
