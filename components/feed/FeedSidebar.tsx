'use client';

import { memo } from 'react';
import { TopicBucketPills } from '@/components/feed/TopicBucketPills';
import { PlatformStatsWidget } from '@/components/feed/PlatformStatsWidget';
import { RecentResolutionsWidget } from '@/components/feed/RecentResolutionsWidget';
import { TrendingTopicsWidget } from '@/components/feed/TrendingTopicsWidget';
import type { FeedPlatformStats } from '@/lib/feed-platform-stats';
import type { RecentResolution } from '@/lib/recent-resolutions';
import type { TrendingTopicDto } from '@/services/api';

type FeedSidebarProps = {
  activeBucketSlug?: string;
  trendingTopics: TrendingTopicDto[];
  trendingLoading?: boolean;
  recentResolutions: RecentResolution[];
  platformStats: FeedPlatformStats;
  showBucketFilters?: boolean;
  className?: string;
};

export const FeedSidebar = memo(function FeedSidebar({
  activeBucketSlug,
  trendingTopics,
  trendingLoading = false,
  recentResolutions,
  platformStats,
  showBucketFilters = true,
  className = '',
}: FeedSidebarProps) {
  return (
    <aside
      className={`space-y-4 ${className}`.trim()}
      aria-label="Feed sidebar"
    >
      {showBucketFilters && activeBucketSlug
        ? (
            <TopicBucketPills activeBucketSlug={activeBucketSlug} />
          )
        : null}
      <TrendingTopicsWidget topics={trendingTopics} loading={trendingLoading} />
      <RecentResolutionsWidget items={recentResolutions} />
      <PlatformStatsWidget stats={platformStats} />
    </aside>
  );
});
