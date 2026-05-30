import type { LeaderboardRow } from '@/lib/leaderboard';
import type { UseDiscoveryFeedPageResult } from '@/hooks/useDiscoveryFeedPage';
import type { UseLeaderboardResult } from '@/hooks/useLeaderboard';
import type { UsePredictionFeedResult } from '@/hooks/usePredictionFeed';
import { vi } from 'vitest';

export function idlePredictionFeed(
  overrides: Partial<UsePredictionFeedResult> = {},
): UsePredictionFeedResult {
  return {
    data: [],
    loading: false,
    loadingMore: false,
    error: null,
    hasMore: false,
    refetch: vi.fn(),
    loadMore: vi.fn(),
    ...overrides,
  };
}

export function idleDiscoveryFeedPage(
  overrides: Partial<UseDiscoveryFeedPageResult> = {},
): UseDiscoveryFeedPageResult {
  return {
    listSort: 'newest',
    setListSort: vi.fn(),
    outcomeFilter: 'all',
    setOutcomeFilter: vi.fn(),
    handleOutcomeFilter: vi.fn(),
    clearOutcomeFilter: vi.fn(),
    listData: [],
    scopeData: [],
    loading: false,
    loadingMore: false,
    error: null,
    hasMore: false,
    refetch: vi.fn(),
    loadMore: vi.fn(),
    recentResolutions: [],
    platformStats: { trackedCount: 0, averageAccuracyPercent: null },
    ...overrides,
  };
}

export function idleLeaderboard(
  overrides: Partial<UseLeaderboardResult> = {},
): UseLeaderboardResult {
  return {
    rows: [] as LeaderboardRow[],
    loading: false,
    error: null,
    refetch: vi.fn(),
    ...overrides,
  };
}
