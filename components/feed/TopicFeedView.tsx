'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import {
  breadcrumbLinkClass,
  DiscoveryFeedLayout,
} from '@/components/feed/DiscoveryFeedLayout';
import { FeedSidebar } from '@/components/feed/FeedSidebar';
import { outcomeLabels } from '@/components/predictions/outcome-display';
import { useDiscoveryFeedPage } from '@/hooks/useDiscoveryFeedPage';
import { useTopicCatalog } from '@/hooks/useTopicCatalog';
import { topicPagePath } from '@/lib/topic-path';
import { useTrendingTopics } from '@/hooks/useTrendingTopics';
import type { Topic } from '@/types/topic';
import type { Outcome } from '@/types/prediction';

type TopicFeedViewProps = {
  topic: Topic;
};

export function TopicFeedView({ topic }: TopicFeedViewProps) {
  const feed = useDiscoveryFeedPage({ topicSlug: topic.slug });
  const trending = useTrendingTopics({
    bucket: topic.kind === 'bucket' ? topic.slug : undefined,
    limit: 5,
  });
  const { getParentBucketTopics } = useTopicCatalog();
  const parentBuckets = topic.kind === 'curated' ? getParentBucketTopics(topic) : [];

  const emptyMessage = useMemo(() => {
    if (feed.outcomeFilter !== 'all') {
      return `No ${outcomeLabels[feed.outcomeFilter as Outcome].toLowerCase()} forecasts for this topic yet.`;
    }
    return 'No predictions for this topic yet.';
  }, [feed.outcomeFilter]);

  return (
    <DiscoveryFeedLayout
      header={(
        <>
          <p className="text-sm text-muted">
            <Link href="/" className={breadcrumbLinkClass}>
              Home
            </Link>
            <span aria-hidden> / </span>
            <span>Topic</span>
          </p>
          <h1 className="font-serif text-3xl font-normal tracking-tight text-foreground sm:text-4xl">
            {topic.name}
          </h1>
          {parentBuckets.length > 0
            ? (
                <ul
                  className="flex list-none flex-wrap gap-2"
                  aria-label="Parent topics"
                >
                  {parentBuckets.map(bucket => (
                    <li key={bucket.id}>
                      <Link
                        href={topicPagePath(bucket.slug)}
                        className="inline-flex min-h-11 items-center rounded-full border border-border bg-surface-elevated px-3 py-1 text-sm font-medium text-foreground hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        {bucket.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )
            : null}
        </>
      )}
      emptyMessage={emptyMessage}
      listSort={feed.listSort}
      onListSortChange={feed.setListSort}
      outcomeFilter={feed.outcomeFilter}
      onOutcomeFilter={feed.handleOutcomeFilter}
      onClearOutcomeFilter={feed.clearOutcomeFilter}
      listData={feed.listData}
      loading={feed.loading}
      loadingMore={feed.loadingMore}
      error={feed.error}
      hasMore={feed.hasMore}
      onRetry={() => void feed.refetch()}
      onLoadMore={() => void feed.loadMore()}
      sidebar={(
        <FeedSidebar
          activeBucketSlug={topic.kind === 'bucket' ? topic.slug : undefined}
          trendingTopics={trending.data}
          trendingLoading={trending.loading}
          recentResolutions={feed.recentResolutions}
          platformStats={feed.platformStats}
          showBucketFilters={topic.kind === 'bucket'}
        />
      )}
    />
  );
}
