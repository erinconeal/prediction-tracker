'use client';

import { Trophy } from 'lucide-react';

export function LeaderboardRankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 font-mono text-xs font-semibold tabular-nums text-primary">
        <Trophy className="size-3.5 shrink-0" aria-hidden />
        #1
      </span>
    );
  }
  if (rank === 2) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-interactive/12 px-2 py-0.5 font-mono text-xs font-semibold tabular-nums text-interactive">
        #2
      </span>
    );
  }
  if (rank === 3) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-accent-attention/15 px-2 py-0.5 font-mono text-xs font-semibold tabular-nums text-accent-attention">
        #3
      </span>
    );
  }
  return (
    <span className="font-mono text-sm tabular-nums text-muted">
      {String(rank).padStart(2, '0')}
    </span>
  );
}
