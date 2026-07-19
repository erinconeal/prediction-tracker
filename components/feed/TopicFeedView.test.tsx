import '@/test/mocks/use-topic-catalog';
import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi, type Mock } from 'vitest';
import {
  buildTopic,
  curatedAiTopic,
} from '@/test/factories/topic';
import { idleDiscoveryFeedPage } from '@/test/factories/hook-results';
import {
  resetTopicCatalogMockForTests,
  topicCatalogMockValue,
} from '@/test/mocks/use-topic-catalog';
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

const mockUseDiscoveryFeedPage = vi.mocked(useDiscoveryFeedPage);

const bucketTopic = buildTopic({
  id: 'topic-finance',
  slug: 'finance',
  name: 'Finance',
  kind: 'bucket',
  parentTopicIds: [],
});

describe('TopicFeedView', () => {
  beforeEach(() => {
    resetTopicCatalogMockForTests();
    mockUseDiscoveryFeedPage.mockReset();
    mockUseDiscoveryFeedPage.mockReturnValue(idleDiscoveryFeedPage());
    mockUseTrendingTopics.mockClear();
    mockUseTrendingTopics.mockReturnValue({
      data: [],
      loading: false,
      error: null,
    });
  });

  test('given a curated topic, should load feed via discovery scope hook', () => {
    render(<TopicFeedView topic={curatedAiTopic} />);

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

  test('given a bucket topic, should not request parent bucket topics', () => {
    const spy = vi.spyOn(topicCatalogMockValue, 'getParentBucketTopics');

    render(<TopicFeedView topic={bucketTopic} />);

    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  test('given curated topic while catalog is loading, should not render parentless breadcrumb trail', () => {
    topicCatalogMockValue.loading = true;
    topicCatalogMockValue.topics = [];

    render(<TopicFeedView topic={curatedAiTopic} />);

    expect(
      screen.queryByRole('navigation', { name: 'Breadcrumb' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { level: 1, name: 'AI regulation 2026' }),
    ).toBeInTheDocument();
  });

  test('given parent bucket topics, should render ordered breadcrumb links', async () => {
    render(<TopicFeedView topic={curatedAiTopic} />);

    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    const trail = within(nav).getByRole('list');
    expect(trail.tagName).toBe('OL');

    expect(within(trail).getByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/',
    );
    expect(
      await within(trail).findByRole('link', { name: 'Tech' }),
    ).toHaveAttribute('href', '/tech');
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
