'use client';

import Link from 'next/link';
import { memo } from 'react';
import {
  OutcomeGlyph,
  outcomeAccentTextStyles,
  outcomeIconCircleStyles,
  outcomeLabels,
} from '@/components/predictions/outcome-display';
import { InfoPopover } from '@/components/ui/InfoPopover';
import {
  WIDGET_RECENTLY_JUDGED,
  WIDGET_RECENTLY_JUDGED_EMPTY,
  WIDGET_RECENTLY_JUDGED_HINT,
} from '@/lib/lifecycle-copy';
import type { RecentlyJudgedScored } from '@/lib/recently-judged-scored';
import { formatFinishedRelativeTime } from '@/utils/format-date';
import { truncateWithEllipsis } from '@/utils/truncate-text';

type RecentlyJudgedWidgetProps = {
  items: RecentlyJudgedScored[];
  className?: string;
};

const QUOTED_EXCERPT_MAX = 52;

function quotedExcerpt(text: string): string {
  return `"${truncateWithEllipsis(text, QUOTED_EXCERPT_MAX)}"`;
}

export const RecentlyJudgedWidget = memo(function RecentlyJudgedWidget({
  items,
  className = '',
}: RecentlyJudgedWidgetProps) {
  return (
    <section
      className={`rounded-xl border border-border bg-surface-elevated p-4 shadow-sm ${className}`.trim()}
      aria-labelledby="recently-judged-heading"
    >
      <div className="flex items-center justify-between gap-2">
        <h2
          id="recently-judged-heading"
          className="min-w-0 text-sm font-semibold text-foreground"
        >
          {WIDGET_RECENTLY_JUDGED}
        </h2>
        <InfoPopover label={`About ${WIDGET_RECENTLY_JUDGED}`}>
          {WIDGET_RECENTLY_JUDGED_HINT}
        </InfoPopover>
      </div>
      {items.length === 0
        ? (
            <p className="mt-3 text-sm text-muted">{WIDGET_RECENTLY_JUDGED_EMPTY}</p>
          )
        : (
            <ul className="mt-3 space-y-4">
              {items.map(({ prediction: p, finishedAt }) => (
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
                        {formatFinishedRelativeTime(finishedAt)}
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
