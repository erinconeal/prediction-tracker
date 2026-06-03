'use client';

import Link from 'next/link';
import { forwardRef } from 'react';

export const LeaderboardPageHeader = forwardRef<HTMLHeadingElement>(
  function LeaderboardPageHeader(_props, ref) {
    return (
      <header className="max-w-3xl space-y-3">
        <div className="flex items-end gap-2">
          <h1
            ref={ref}
            id="leaderboard-page-heading"
            tabIndex={-1}
            className="font-serif text-3xl font-normal tracking-tight text-foreground outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Leaderboard
          </h1>
          <Link
            href="/about"
            className="text-interactive underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive"
          >
            How we score
          </Link>
        </div>
      </header>
    );
  },
);
