import { render, screen, within } from '@testing-library/react';
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

const mockGetParentBucketTopics = vi.fn<() => Topic[]>(() => []);

vi.mock('@/hooks/useTopicCatalog', () => ({
  useTopicCatalog: () => ({
    topics: [],
    loading: false,
    getTopicsByIds: () => [],
    getPrimaryTopicForPrediction: () => null,
    getParentBucketTopics: mockGetParentBucketTopics,
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

const parentTech: Topic = {
  id: 'topic-tech',
  slug: 'technology',
  name: 'Technology',
  kind: 'bucket',
  parentTopicIds: [],
};

const parentPolitics: Topic = {
  id: 'topic-politics',
  slug: 'politics',
  name: 'Politics',
  kind: 'bucket',
  parentTopicIds: [],
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
    mockGetParentBucketTopics.mockReset();
    mockGetParentBucketTopics.mockReturnValue([]);
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
    ).toHaveAttribute('href', '/finance');
  });

  test('given parent bucket topics, should render ordered breadcrumb links', () => {
    mockGetParentBucketTopics.mockReturnValue([parentTech, parentPolitics]);

    render(<TopicFeedView topic={curatedTopic} />);

    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    const trail = within(nav).getByRole('list');
    expect(trail.tagName).toBe('OL');

    expect(within(trail).getByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/',
    );
    expect(
      within(trail).getByRole('link', { name: 'Technology' }),
    ).toHaveAttribute('href', '/technology');
    expect(
      within(trail).getByRole('link', { name: 'Politics' }),
    ).toHaveAttribute('href', '/politics');
    expect(
      within(trail).getByText('AI regulation 2026', { selector: '[aria-current="page"]' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: 'AI regulation 2026' }),
    ).toBeInTheDocument();
  });
});
