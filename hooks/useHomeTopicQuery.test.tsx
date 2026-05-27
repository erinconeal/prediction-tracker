import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useHomeTopicQuery } from './useHomeTopicQuery';

const mockReplace = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => '/',
}));

describe('useHomeTopicQuery', () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockSearchParams = new URLSearchParams();
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
    mockSearchParams = new URLSearchParams('topic=finance');

    const { result } = renderHook(() => useHomeTopicQuery());

    expect(result.current.topicTab).toBe('Finance');
    expect(result.current.topicSlug).toBe('finance');
    expect(result.current.isFeedReady).toBe(true);
  });

  test('given curated topic slug, should mark feed not ready and redirect', async () => {
    mockSearchParams = new URLSearchParams('topic=ai-regulation-2026');

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
    mockSearchParams = new URLSearchParams('topic=not-a-real-slug');

    const { result } = renderHook(() => useHomeTopicQuery());

    expect(result.current.isFeedReady).toBe(false);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/', { scroll: false });
    });
  });
});
