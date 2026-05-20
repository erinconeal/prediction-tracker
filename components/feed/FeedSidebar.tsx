'use client';

import { memo } from 'react';
import { CategoryFilterPills } from '@/components/feed/CategoryFilterPills';
import { PlatformStatsWidget } from '@/components/feed/PlatformStatsWidget';
import { RecentResolutionsWidget } from '@/components/feed/RecentResolutionsWidget';
import { TrendingTopicsWidget } from '@/components/feed/TrendingTopicsWidget';
import type { FeedPlatformStats } from '@/lib/feed-platform-stats';
import type { RecentResolution } from '@/lib/recent-resolutions';
import type { TrendingTopicDto } from '@/services/api';
import type { Category } from '@/types/category';

type FeedSidebarProps = {
  activeCategory?: Category;
  trendingTopics: TrendingTopicDto[];
  trendingLoading?: boolean;
  recentResolutions: RecentResolution[];
  platformStats: FeedPlatformStats;
  showCategoryFilters?: boolean;
  className?: string;
};

export const FeedSidebar = memo(function FeedSidebar({
  activeCategory,
  trendingTopics,
  trendingLoading = false,
  recentResolutions,
  platformStats,
  showCategoryFilters = true,
  className = '',
}: FeedSidebarProps) {
  return (
    <aside
      className={`space-y-4 ${className}`.trim()}
      aria-label="Feed sidebar"
    >
      {showCategoryFilters && activeCategory
        ? (
            <CategoryFilterPills activeCategory={activeCategory} />
          )
        : null}
      <TrendingTopicsWidget topics={trendingTopics} loading={trendingLoading} />
      <RecentResolutionsWidget items={recentResolutions} />
      <PlatformStatsWidget stats={platformStats} />
    </aside>
  );
});
