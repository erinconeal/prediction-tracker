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
import { categoryToSlug, type Category } from '@/types/category';
import type { Outcome } from '@/types/prediction';

type CategoryFeedViewProps = {
  category: Category;
};

export function CategoryFeedView({ category }: CategoryFeedViewProps) {
  const feed = useDiscoveryFeedPage({ kind: 'category', category });
  const trending = useTrendingTopics({
    category: categoryToSlug(category),
    limit: 5,
  });

  const emptyMessage = useMemo(() => {
    if (feed.outcomeFilter !== 'all') {
      return `No ${outcomeLabels[feed.outcomeFilter as Outcome].toLowerCase()} forecasts in ${category} yet.`;
    }
    return `No predictions in ${category} yet.`;
  }, [category, feed.outcomeFilter]);

  return (
    <DiscoveryFeedLayout
      header={(
        <>
          <p className="text-sm text-muted">
            <Link href="/" className={breadcrumbLinkClass}>
              Home
            </Link>
            <span aria-hidden> / </span>
            <span>{category}</span>
          </p>
          <h1 className="font-serif text-3xl font-normal tracking-tight text-foreground sm:text-4xl">
            {category}
          </h1>
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
          activeCategory={category}
          trendingTopics={trending.data}
          trendingLoading={trending.loading}
          recentResolutions={feed.recentResolutions}
          platformStats={feed.platformStats}
        />
      )}
    />
  );
}
