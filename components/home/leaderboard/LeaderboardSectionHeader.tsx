'use client';

import Link from 'next/link';

export function LeaderboardSectionHeader() {
  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2
          id="leaderboard-heading"
          className="font-serif text-2xl font-normal tracking-tight text-foreground sm:text-3xl"
        >
          Top predictors
        </h2>
        <Link
          href="/about"
          className="text-sm text-interactive underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive"
        >
          (How we score)
        </Link>
      </div>
    </div>
  );
}
