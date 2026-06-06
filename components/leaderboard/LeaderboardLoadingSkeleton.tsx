'use client';

export function LeaderboardLoadingSkeleton({ variant = 'preview' }: {
  variant?: 'preview' | 'full';
}) {
  if (variant === 'full') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="h-64 animate-pulse rounded-md bg-surface motion-reduce:animate-none"
        aria-busy="true"
        aria-label="Loading leaderboard"
      />
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className="grid gap-6 lg:grid-cols-2"
      aria-busy="true"
      aria-label="Loading leaderboard"
    >
      <div className="h-48 animate-pulse rounded-xl bg-surface-elevated motion-reduce:animate-none" />
      <div className="h-48 animate-pulse rounded-md bg-surface motion-reduce:animate-none" />
    </div>
  );
}
