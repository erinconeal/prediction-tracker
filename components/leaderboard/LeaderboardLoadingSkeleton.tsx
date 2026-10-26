import { LoadingRegion } from '@/components/ui/LoadingRegion';
import { Skeleton } from '@/components/ui/Skeleton';

export function LeaderboardLoadingSkeleton({ variant = 'preview' }: {
  variant?: 'preview' | 'full';
}) {
  if (variant === 'full') {
    return (
      <LoadingRegion label="Loading leaderboard">
        <Skeleton className="h-64 rounded-md" />
      </LoadingRegion>
    );
  }

  return (
    <LoadingRegion
      label="Loading leaderboard"
      className="grid gap-6 lg:grid-cols-2"
    >
      <Skeleton tone="elevated" className="h-48 rounded-xl" />
      <Skeleton className="h-48 rounded-md" />
    </LoadingRegion>
  );
}
