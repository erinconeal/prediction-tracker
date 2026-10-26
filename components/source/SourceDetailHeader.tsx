'use client';

import Link from 'next/link';

import { breadcrumbLinkClass } from '@/components/feed/DiscoveryFeedLayout';
import { SourceAccuracyBadge } from '@/components/forecast/SourceAccuracyBadge';
import { LoadingRegion } from '@/components/ui/LoadingRegion';
import { Skeleton } from '@/components/ui/Skeleton';
import { SourceAvatar } from '@/components/ui/SourceAvatar';
import { forecastDisplayMetricFromAccuracyPercent } from '@/lib/forecast-display-metric';

type SourceDetailHeaderProps = {
  displayName: string;
  accuracy: number | null;
  loading?: boolean;
};

export function SourceDetailHeader({
  displayName,
  accuracy,
  loading = false,
}: SourceDetailHeaderProps) {
  const metric = forecastDisplayMetricFromAccuracyPercent(accuracy);
  return (
    <header className="space-y-4" aria-label="Source profile">
      <nav aria-label="Breadcrumb">
        <ol className="m-0 flex list-none flex-wrap items-center gap-x-1 gap-y-1 p-0 text-sm text-muted">
          <li className="inline-flex items-center gap-x-1">
            <Link href="/" className={breadcrumbLinkClass}>
              Home
            </Link>
          </li>
          <li aria-current="page" className="inline-flex items-center gap-x-1">
            <span aria-hidden> / </span>
            <span className="font-medium text-foreground">{displayName}</span>
          </li>
        </ol>
      </nav>

      {loading
        ? (
            <LoadingRegion label="Loading source" className="flex items-start gap-4">
              <Skeleton className="size-16 shrink-0 rounded-full" />
              <div className="min-w-0 flex-1 space-y-2 pt-1">
                <Skeleton className="h-9 w-48 max-w-full rounded" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            </LoadingRegion>
          )
        : (
            <div className="flex flex-wrap items-start gap-4">
              <SourceAvatar name={displayName} size="lg" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <h1 className="font-serif text-3xl font-normal tracking-tight text-foreground sm:text-4xl">
                    {displayName}
                  </h1>
                  <SourceAccuracyBadge metric={metric} />
                </div>
              </div>
            </div>
          )}
    </header>
  );
}
