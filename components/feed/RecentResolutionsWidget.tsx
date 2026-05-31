'use client';

import Link from 'next/link';
import { memo } from 'react';
import {
  OutcomeGlyph,
  outcomeAccentTextStyles,
  outcomeIconCircleStyles,
  outcomeLabels,
} from '@/components/predictions/outcome-display';
import type { RecentResolution } from '@/lib/recent-resolutions';
import { formatResolvedRelativeTime } from '@/utils/format-date';
import { truncateWithEllipsis } from '@/utils/truncate-text';

type RecentResolutionsWidgetProps = {
  items: RecentResolution[];
  className?: string;
};

const QUOTED_EXCERPT_MAX = 52;

function quotedExcerpt(text: string): string {
  return `"${truncateWithEllipsis(text, QUOTED_EXCERPT_MAX)}"`;
}

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
            <ul className="mt-3 space-y-4">
              {items.map(({ prediction: p, resolvedAt }) => (
                <li key={p.id} className="list-none">
                  <Link
                    href={`/predictions/${p.id}`}
                    className="group flex gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <span
                      className={`flex size-9 shrink-0 items-center justify-center rounded-full [&_svg]:size-4 ${outcomeIconCircleStyles[p.outcome]}`}
                      aria-hidden
                    >
                      <OutcomeGlyph outcome={p.outcome} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm text-foreground group-hover:text-interactive">
                        {quotedExcerpt(p.text)}
                      </span>
                      <span className="mt-1 block text-xs text-muted">
                        {p.source}
                        {' · '}
                        Resolved
                        {' '}
                        {formatResolvedRelativeTime(resolvedAt)}
                        {' · '}
                        <span
                          className={`font-semibold ${outcomeAccentTextStyles[p.outcome]}`}
                        >
                          {outcomeLabels[p.outcome]}
                        </span>
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
    </section>
  );
});
