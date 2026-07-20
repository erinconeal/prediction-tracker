import '@/test/mocks/api-service';
import '@/test/mocks/next-navigation';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test } from 'vitest';
import { ApiError } from '@/services/api';
import { getTopic } from '@/test/mocks/api-service';
import {
  mockReplace,
  resetNextNavigationMocks,
  setMockSearchParams,
} from '@/test/mocks/next-navigation';
import { useHomeTopicQuery } from './useHomeTopicQuery';

describe('useHomeTopicQuery', () => {
  beforeEach(() => {
    resetNextNavigationMocks();
    getTopic.mockReset();
    getTopic.mockImplementation(async (slug: string) => {
      if (slug === 'ai-regulation-2026') {
        return {
          id: 'topic-ai-regulation-2026',
          slug: 'ai-regulation-2026',
          name: 'AI regulation 2026',
          kind: 'curated' as const,
          parentTopicIds: [],
          predictionCount: 1,
        };
      }
      throw new ApiError('Topic not found', 404);
    });
  });

  test('given no topic query, should resolve to All tab and feed ready', () => {
    const { result } = renderHook(() => useHomeTopicQuery());

    expect(result.current.topicTab).toBe('All');
    expect(result.current.topicSlug).toBeUndefined();
    expect(result.current.isFeedReady).toBe(true);
    expect(result.current.topicResolution).toEqual({
      kind: 'tab',
      tab: 'All',
    });
  });

  test('given finance slug, should resolve Finance tab and finance topic slug', () => {
    setMockSearchParams(new URLSearchParams('topic=finance'));

    const { result } = renderHook(() => useHomeTopicQuery());

    expect(result.current.topicTab).toBe('Finance');
    expect(result.current.topicSlug).toBe('finance');
    expect(result.current.isFeedReady).toBe(true);
  });

  test('given curated topic slug, should mark feed not ready and redirect', async () => {
    setMockSearchParams(new URLSearchParams('topic=ai-regulation-2026'));

    const { result } = renderHook(() => useHomeTopicQuery());

    expect(result.current.isFeedReady).toBe(false);
    expect(result.current.topicTab).toBe('All');

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        '/ai-regulation-2026',
        { scroll: false },
      );
    });
  });

  test('given unknown topic slug, should strip query and mark feed not ready until replace', async () => {
    setMockSearchParams(new URLSearchParams('topic=not-a-real-slug'));

    const { result } = renderHook(() => useHomeTopicQuery());

    expect(result.current.isFeedReady).toBe(false);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/', { scroll: false });
    });
  });

  test('given unusable topic response, should strip query like unknown slug', async () => {
    setMockSearchParams(new URLSearchParams('topic=mystery'));
    getTopic.mockRejectedValue(
      new ApiError('Topic response must include a slug and a known kind', 200),
    );

    const { result } = renderHook(() => useHomeTopicQuery());

    expect(result.current.isFeedReady).toBe(false);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/', { scroll: false });
    });
  });

  test('given non-404 API failure, should leave pending and keep topic query', async () => {
    setMockSearchParams(new URLSearchParams('topic=ai-regulation-2026'));
    getTopic.mockRejectedValue(new ApiError('Server error', 500));

    const { result } = renderHook(() => useHomeTopicQuery());

    await waitFor(() => {
      expect(getTopic).toHaveBeenCalled();
    });

    expect(result.current.topicResolution).toEqual({ kind: 'pending' });
    expect(result.current.isFeedReady).toBe(false);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  test('given lookup aborted on unmount, should not strip or redirect', async () => {
    setMockSearchParams(new URLSearchParams('topic=ai-regulation-2026'));
    getTopic.mockImplementation(
      () => new Promise(() => {
        /* never settles */
      }),
    );

    const { result, unmount } = renderHook(() => useHomeTopicQuery());

    expect(result.current.topicResolution).toEqual({ kind: 'pending' });
    unmount();

    await Promise.resolve();
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
