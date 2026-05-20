'use client';

import Link from 'next/link';
import { memo } from 'react';
import { outcomeLabels } from '@/components/predictions/outcome-display';
import type { RecentResolution } from '@/lib/recent-resolutions';
import { truncateWithEllipsis } from '@/utils/truncate-text';

type RecentResolutionsWidgetProps = {
  items: RecentResolution[];
  className?: string;
};

export const RecentResolutionsWidget = memo(function RecentResolutionsWidget({
  items,
  className = '',
}: RecentResolutionsWidgetProps) {
  return (
    <section
      className={`rounded-xl border border-border bg-surface-elevated p-4 shadow-sm ${className}`.trim()}
      aria-labelledby="recent-resolutions-heading"
    >
      <h2
        id="recent-resolutions-heading"
        className="text-sm font-semibold text-foreground"
      >
        Recent resolutions
      </h2>
      {items.length === 0
        ? (
            <p className="mt-3 text-sm text-muted">No resolved forecasts yet.</p>
          )
        : (
            <ul className="mt-3 space-y-3">
              {items.map(({ prediction: p }) => (
                <li key={p.id} className="list-none border-b border-border/60 pb-3 last:border-0 last:pb-0">
                  <Link
                    href={`/predictions/${p.id}`}
                    className="group block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <p className="text-sm text-foreground group-hover:text-interactive">
                      {truncateWithEllipsis(p.text, 72)}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      <span className="font-medium text-foreground">
                        {outcomeLabels[p.outcome]}
                      </span>
                      {' · '}
                      {p.source}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
    </section>
  );
});
