'use client';

import Link from 'next/link';
import { memo, type ReactNode } from 'react';
import { SourceAvatar } from '@/components/ui/SourceAvatar';
import { forecastCardFooterDividerClass, forecastCardLinkClass } from './forecast-card-tokens';

type ForecastCardFooterProps = {
  sourceName: string;
  sourceSlug: string;
  secondaryLine?: ReactNode;
  endSlot?: ReactNode;
  className?: string;
};

export const ForecastCardFooter = memo(function ForecastCardFooter({
  sourceName,
  sourceSlug,
  secondaryLine,
  endSlot,
  className = '',
}: ForecastCardFooterProps) {
  return (
    <div className={`${forecastCardFooterDividerClass} ${className}`.trim()}>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          Source
        </p>
        <div className="mt-2 flex min-w-0 items-center gap-2">
          <SourceAvatar name={sourceName} size="sm" />
          <Link
            href={`/source/${encodeURIComponent(sourceSlug)}`}
            className={`truncate text-sm font-medium text-foreground underline-offset-2 hover:underline ${forecastCardLinkClass}`}
          >
            {sourceName}
          </Link>
        </div>
        {secondaryLine
          ? (
              <div className="mt-0.5 text-xs tabular-nums text-muted">
                {secondaryLine}
              </div>
            )
          : null}
      </div>
      {endSlot ? <div className="shrink-0">{endSlot}</div> : null}
    </div>
  );
});
