'use client';

import { TrendingDown, TrendingUp } from 'lucide-react';
import type { LeaderboardRow } from '@/lib/leaderboard';

function formatStreak(row: LeaderboardRow): string | null {
  if (row.streakKind === null || row.streakLength < 2) return null;
  const label = row.streakKind === 'correct' ? 'correct' : 'incorrect';
  return `${row.streakLength} ${label} in a row`;
}

export function LeaderboardStreakBadge({ row }: { row: LeaderboardRow }) {
  const text = formatStreak(row);
  if (!text) return null;
  const positive = row.streakKind === 'correct';
  return (
    <p
      className={
        positive
          ? 'mt-1 inline-flex items-center gap-1 rounded-full bg-success/12 px-2 py-0.5 text-xs font-medium text-success'
          : 'mt-1 inline-flex items-center gap-1 rounded-full bg-error/12 px-2 py-0.5 text-xs font-medium text-error'
      }
    >
      {positive
        ? (
            <TrendingUp className="size-3.5 shrink-0" aria-hidden />
          )
        : (
            <TrendingDown className="size-3.5 shrink-0" aria-hidden />
          )}
      {text}
    </p>
  );
}
