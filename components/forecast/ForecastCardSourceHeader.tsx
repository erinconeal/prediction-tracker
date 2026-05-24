'use client';

import Link from 'next/link';
import { memo, type ReactNode } from 'react';
import { SourceAvatar } from '@/components/ui/SourceAvatar';
import { forecastCardLinkClass } from './forecast-card-tokens';

type ForecastCardSourceHeaderProps = {
  sourceName: string;
  sourceSlug: string;
  headerEnd: ReactNode;
  className?: string;
};

export const ForecastCardSourceHeader = memo(function ForecastCardSourceHeader({
  sourceName,
  sourceSlug,
  headerEnd,
  className = '',
}: ForecastCardSourceHeaderProps) {
  return (
    <div className={`flex min-w-0 items-center justify-between gap-3 ${className}`.trim()}>
      <Link
        href={`/source/${encodeURIComponent(sourceSlug)}`}
        className={`flex min-h-11 min-w-0 flex-1 items-center gap-2 ${forecastCardLinkClass}`}
      >
        <SourceAvatar name={sourceName} size="sm" />
        <span className="truncate text-sm font-medium text-foreground">
          {sourceName}
        </span>
      </Link>
      <div className="shrink-0">{headerEnd}</div>
    </div>
  );
});
