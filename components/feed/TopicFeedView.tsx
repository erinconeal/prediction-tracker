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
import { useTrendingTopics } from '@/hooks/useTrendingTopics';
import { categoryToSlug } from '@/types/category';
import type { Topic } from '@/types/topic';
import type { Outcome } from '@/types/prediction';

type TopicFeedViewProps = {
  topic: Topic;
};

export function TopicFeedView({ topic }: TopicFeedViewProps) {
  const feed = useDiscoveryFeedPage({ kind: 'topic', topicSlug: topic.slug });
  const trending = useTrendingTopics({ limit: 5 });

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
          <ul
            className="flex list-none flex-wrap gap-2"
            aria-label="Topic categories"
          >
            {topic.categories.map(cat => (
              <li key={cat}>
                <Link
                  href={`/category/${categoryToSlug(cat)}`}
                  className="inline-flex min-h-11 items-center rounded-full border border-border bg-surface-elevated px-3 py-1 text-sm font-medium text-foreground hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  {cat}
                </Link>
              </li>
            ))}
          </ul>
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
          trendingTopics={trending.data}
          trendingLoading={trending.loading}
          recentResolutions={feed.recentResolutions}
          platformStats={feed.platformStats}
          showCategoryFilters={false}
        />
      )}
    />
  );
}
