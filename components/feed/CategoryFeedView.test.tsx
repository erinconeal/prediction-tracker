import { render } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { CategoryFeedView } from './CategoryFeedView';
import { useDiscoveryFeedPage } from '@/hooks/useDiscoveryFeedPage';

vi.mock('@/hooks/useDiscoveryFeedPage', () => ({
  useDiscoveryFeedPage: vi.fn(),
}));

vi.mock('@/hooks/useTrendingTopics', () => ({
  useTrendingTopics: () => ({ data: [], loading: false, error: null }),
}));

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

const mockUseDiscoveryFeedPage = vi.mocked(useDiscoveryFeedPage);

function idleFeed() {
  return {
    listSort: 'newest' as const,
    setListSort: vi.fn(),
    outcomeFilter: 'all' as const,
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
  };
}

describe('CategoryFeedView', () => {
  beforeEach(() => {
    mockUseDiscoveryFeedPage.mockReset();
    mockUseDiscoveryFeedPage.mockReturnValue(idleFeed());
  });

  test('given a category, should load feed via discovery scope hook', () => {
    render(<CategoryFeedView category="Finance" />);

    expect(mockUseDiscoveryFeedPage).toHaveBeenCalledWith({
      kind: 'category',
      category: 'Finance',
    });
  });
});
