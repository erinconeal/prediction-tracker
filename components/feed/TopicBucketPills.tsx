'use client';

import Link from 'next/link';
import { memo } from 'react';
import { BUCKET_TOPICS } from '@/lib/topic-buckets';
import { topicPagePath } from '@/lib/topic-path';

type TopicBucketPillsProps = {
  activeBucketSlug: string;
  className?: string;
};

export const TopicBucketPills = memo(function TopicBucketPills({
  activeBucketSlug,
  className = '',
}: TopicBucketPillsProps) {
  const normActive = activeBucketSlug.trim().toLowerCase();

  return (
    <section
      className={`rounded-xl border border-border bg-surface-elevated p-4 shadow-sm ${className}`.trim()}
      aria-labelledby="topic-bucket-filters-heading"
    >
      <h2
        id="topic-bucket-filters-heading"
        className="flex items-center gap-2 text-sm font-semibold text-foreground"
      >
        <span className="text-muted" aria-hidden>
          ⏷
        </span>
        Filters
      </h2>
      <ul className="mt-3 flex list-none flex-wrap gap-2">
        {BUCKET_TOPICS.map((bucket) => {
          const isActive = bucket.slug === normActive;
          return (
            <li key={bucket.slug}>
              <Link
                href={topicPagePath(bucket.slug)}
                className={`inline-flex min-h-11 items-center rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  isActive
                    ? 'bg-interactive text-white shadow-sm'
                    : 'border border-border bg-surface text-foreground hover:bg-surface-elevated'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {bucket.name}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
});
