'use client';

import { memo } from 'react';
import { TopicBucketPills } from '@/components/feed/TopicBucketPills';
import { PlatformStatsWidget } from '@/components/feed/PlatformStatsWidget';
import { RecentlyJudgedWidget } from '@/components/feed/RecentlyJudgedWidget';
import { TrendingTopicsWidget } from '@/components/feed/TrendingTopicsWidget';
import type { FeedPlatformStats } from '@/lib/feed-platform-stats';
import type { RecentlyJudgedScored } from '@/lib/recently-judged-scored';
import type { TrendingTopicDto } from '@/services/api';

type FeedSidebarProps = {
  activeBucketSlug?: string;
  trendingTopics: TrendingTopicDto[];
  trendingLoading?: boolean;
  recentlyJudgedScored: RecentlyJudgedScored[];
  platformStats: FeedPlatformStats;
  showBucketFilters?: boolean;
  className?: string;
};

export const FeedSidebar = memo(function FeedSidebar({
  activeBucketSlug,
  trendingTopics,
  trendingLoading = false,
  recentlyJudgedScored,
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
      <RecentlyJudgedWidget items={recentlyJudgedScored} />
      <PlatformStatsWidget stats={platformStats} />
    </aside>
  );
});
