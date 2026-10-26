import { Suspense } from 'react';

import { DashboardView } from '@/components/dashboard/DashboardView';
import { LoadingRegion } from '@/components/ui/LoadingRegion';
import { Skeleton } from '@/components/ui/Skeleton';

export default function HomePage() {
  return (
    <Suspense
      fallback={(
        <LoadingRegion label="Loading dashboard">
          <Skeleton tone="elevated" className="min-h-[50vh] rounded-xl" />
        </LoadingRegion>
      )}
    >
      <DashboardView />
    </Suspense>
  );
}
