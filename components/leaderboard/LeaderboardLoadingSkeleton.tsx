'use client';

export function LeaderboardLoadingSkeleton({ variant = 'preview' }: {
  variant?: 'preview' | 'full';
}) {
  if (variant === 'full') {
    return (
      <div
        className="h-64 animate-pulse rounded-md bg-surface motion-reduce:animate-none"
        aria-hidden
      />
    );
  }

  return (
    <div
      className="grid gap-6 lg:grid-cols-2"
      aria-hidden
    >
      <div className="h-48 animate-pulse rounded-xl bg-surface-elevated motion-reduce:animate-none" />
      <div className="h-48 animate-pulse rounded-md bg-surface motion-reduce:animate-none" />
    </div>
  );
}
