import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi, type Mock } from 'vitest';
import type { Topic } from '@/types/topic';
import { TopicFeedView } from './TopicFeedView';
import { useDiscoveryFeedPage } from '@/hooks/useDiscoveryFeedPage';

vi.mock('@/hooks/useDiscoveryFeedPage', () => ({
  useDiscoveryFeedPage: vi.fn(),
}));

type TrendingTopicsMockOptions = {
  bucket?: string;
  limit?: number;
  enabled?: boolean;
};

const mockUseTrendingTopics: Mock<
  (options?: TrendingTopicsMockOptions) => {
    data: never[];
    loading: boolean;
    error: null;
  }
> = vi.fn(() => ({
  data: [],
  loading: false,
  error: null,
}));

vi.mock('@/hooks/useTrendingTopics', () => ({
  useTrendingTopics: (options?: TrendingTopicsMockOptions) =>
    mockUseTrendingTopics(options),
}));

vi.mock('@/hooks/useTopicCatalog', () => ({
  useTopicCatalog: () => ({
    topics: [],
    loading: false,
    getTopicsByIds: () => [],
    getPrimaryTopicForPrediction: () => null,
    getParentBucketTopics: () => [],
  }),
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

const curatedTopic: Topic = {
  id: 'topic-ai',
  slug: 'ai-regulation-2026',
  name: 'AI regulation 2026',
  kind: 'curated',
  parentTopicIds: ['topic-tech', 'topic-politics'],
};

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

const bucketTopic: Topic = {
  id: 'topic-finance',
  slug: 'finance',
  name: 'Finance',
  kind: 'bucket',
  parentTopicIds: [],
};

describe('TopicFeedView', () => {
  beforeEach(() => {
    mockUseDiscoveryFeedPage.mockReset();
    mockUseDiscoveryFeedPage.mockReturnValue(idleFeed());
    mockUseTrendingTopics.mockClear();
    mockUseTrendingTopics.mockReturnValue({
      data: [],
      loading: false,
      error: null,
    });
  });

  test('given a curated topic, should load feed via discovery scope hook', () => {
    render(<TopicFeedView topic={curatedTopic} />);

    expect(mockUseDiscoveryFeedPage).toHaveBeenCalledWith({
      topicSlug: 'ai-regulation-2026',
    });
    expect(mockUseTrendingTopics).toHaveBeenCalledWith({
      bucket: undefined,
      limit: 5,
    });
  });

  test('given a bucket topic, should scope feed and trending to the bucket', () => {
    render(<TopicFeedView topic={bucketTopic} />);

    expect(mockUseDiscoveryFeedPage).toHaveBeenCalledWith({
      topicSlug: 'finance',
    });
    expect(mockUseTrendingTopics).toHaveBeenCalledWith({
      bucket: 'finance',
      limit: 5,
    });
    expect(
      screen.getByRole('link', { name: 'Finance' }),
    ).toHaveAttribute('href', '/topics/finance');
  });
});
