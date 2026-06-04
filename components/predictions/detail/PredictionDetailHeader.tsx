'use client';

import { forwardRef, type ReactNode } from 'react';
import Link from 'next/link';
import { ForecastCardMetaFooter } from '@/components/forecast/ForecastCardMetaFooter';
import { ForecastCardShell } from '@/components/forecast/ForecastCardShell';
import { breadcrumbLinkClass } from '@/components/feed/DiscoveryFeedLayout';
import { OutcomeBadge } from '@/components/predictions/OutcomeBadge';
import {
  TIMELINE_FINISHED_LABEL,
  TIMELINE_SUBMITTED_LABEL,
} from '@/lib/lifecycle-copy';
import type { Outcome } from '@/types/prediction';
import { formatIsoDate, formatMonthYear } from '@/utils/format-date';
import { truncateWithEllipsis } from '@/utils/truncate-text';

type PredictionDetailHeaderProps = {
  text: string;
  outcome: Outcome;
  createdAt: string;
  targetDate: string | null;
  finishedAt: string | null;
  topicIds: string[];
};

function MetricCell({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">
        {label}
      </p>
      <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-foreground sm:text-base">
        {children}
      </p>
    </div>
  );
}

export const PredictionDetailHeader = forwardRef<
  HTMLHeadingElement,
  PredictionDetailHeaderProps
>(function PredictionDetailHeader(
  {
    text,
    outcome,
    createdAt,
    targetDate,
    finishedAt,
    topicIds,
  },
  ref,
) {
  const breadcrumbTitle = truncateWithEllipsis(text, 48);

  return (
    <header className="space-y-4">
      <nav aria-label="Breadcrumb">
        <ol className="m-0 flex list-none flex-wrap items-center gap-x-1 gap-y-1 p-0 text-sm text-muted">
          <li className="inline-flex items-center gap-x-1">
            <Link href="/" className={breadcrumbLinkClass}>
              Home
            </Link>
          </li>
          <li aria-current="page" className="inline-flex min-w-0 items-center gap-x-1">
            <span aria-hidden> / </span>
            <span className="truncate font-medium text-foreground">
              {breadcrumbTitle}
            </span>
          </li>
        </ol>
      </nav>

      <ForecastCardShell
        wrapTitleInHeading={false}
        title={(
          <div className="flex items-start justify-between gap-3">
            <h1
              ref={ref}
              id="prediction-page-heading"
              tabIndex={-1}
              className="min-w-0 flex-1 font-serif text-2xl font-normal tracking-tight text-foreground outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background md:text-3xl"
            >
              {text}
            </h1>
            <OutcomeBadge outcome={outcome} className="shrink-0 text-sm" />
          </div>
        )}
        afterTitle={(
          <div
            className="mt-6 grid gap-4 sm:grid-cols-3"
            aria-label="Prediction dates"
          >
            <MetricCell label={TIMELINE_SUBMITTED_LABEL}>
              <time dateTime={createdAt}>
                {formatIsoDate(createdAt)}
              </time>
            </MetricCell>
            {targetDate
              ? (
                  <MetricCell label="Target">
                    <time dateTime={targetDate}>
                      {formatMonthYear(targetDate)}
                    </time>
                  </MetricCell>
                )
              : null}
            {finishedAt
              ? (
                  <MetricCell label={TIMELINE_FINISHED_LABEL}>
                    <time dateTime={finishedAt}>
                      {formatIsoDate(finishedAt)}
                    </time>
                  </MetricCell>
                )
              : null}
          </div>
        )}
        footer={<ForecastCardMetaFooter topicIds={topicIds} />}
      />
    </header>
  );
});
