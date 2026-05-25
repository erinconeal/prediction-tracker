import { Suspense } from 'react';
import { DashboardView } from '@/components/dashboard/DashboardView';

export default function HomePage() {
  return (
    <Suspense
      fallback={(
        <div
          className="min-h-[50vh] animate-pulse rounded-xl bg-surface-elevated motion-reduce:animate-none"
          aria-busy="true"
          aria-label="Loading dashboard"
        />
      )}
    >
      <DashboardView />
    </Suspense>
  );
}
