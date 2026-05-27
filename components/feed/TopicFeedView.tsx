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
      headerPrefix={(
        <nav aria-label="Breadcrumb">
          <ol className="m-0 flex list-none flex-wrap items-center gap-x-1 gap-y-1 p-0 text-sm text-muted">
            <li className="inline-flex items-center gap-x-1">
              <Link href="/" className={breadcrumbLinkClass}>
                Home
              </Link>
            </li>
            {parentBuckets.map((bucket, index) => (
              <li key={bucket.id} className="inline-flex items-center gap-x-1">
                <span aria-hidden>{index === 0 ? ' / ' : ' · '}</span>
                <Link
                  href={topicPagePath(bucket.slug)}
                  className={breadcrumbLinkClass}
                >
                  {bucket.name}
                </Link>
              </li>
            ))}
            <li aria-current="page" className="sr-only">
              {topic.name}
            </li>
          </ol>
        </nav>
      )}
      title={(
        <h1 className="font-serif text-3xl font-normal tracking-tight text-foreground sm:text-4xl">
          {topic.name}
        </h1>
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
