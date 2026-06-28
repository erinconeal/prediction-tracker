import '@/test/mocks/api-service';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useMemo } from 'react';
import { beforeEach, describe, expect, test } from 'vitest';
import type { Prediction, PredictionFilters } from '@/types/prediction';
import { buildPrediction } from '@/test/factories/prediction';
import { listPredictions } from '@/test/mocks/api-service';
import { ApiError } from '@/services/api';
import { createDeferred } from '@/test/helpers/deferred';
import {
  usePredictionFeed,
  type UsePredictionFeedResult,
} from './usePredictionFeed';

describe('usePredictionFeed', () => {
  beforeEach(() => {
    listPredictions.mockReset();
  });

  test('given first page resolves, should call list with limit offset zero and expose rows', async () => {
    const a = buildPrediction({ id: 'a' });
    listPredictions.mockResolvedValue([a]);

    const { result } = renderHook(() =>
      usePredictionFeed({ status: 'all' }, { pageSize: 20 }),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(listPredictions).toHaveBeenCalledWith(
      { status: 'all', limit: 20, offset: 0 },
      expect.any(AbortSignal),
    );
    expect(result.current.data).toEqual([a]);
    expect(result.current.error).toBe(null);
    expect(result.current.hasMore).toBe(false);
  });

  test('given full first page, loadMore should request next offset and append', async () => {
    const page1 = [
      buildPrediction({ id: '0' }),
      buildPrediction({ id: '1' }),
    ];
    const page2 = [buildPrediction({ id: '2' })];
    listPredictions
      .mockResolvedValueOnce(page1)
      .mockResolvedValueOnce(page2);

    const { result } = renderHook(() =>
      usePredictionFeed({ status: 'all' }, { pageSize: 2 }),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.hasMore).toBe(true);
    expect(result.current.data).toHaveLength(2);

    await act(async () => {
      await result.current.loadMore();
    });

    expect(listPredictions).toHaveBeenLastCalledWith(
      { status: 'all', limit: 2, offset: 2 },
      expect.any(AbortSignal),
    );
    expect(result.current.data).toHaveLength(3);
    expect(result.current.hasMore).toBe(false);
  });

  test('given filter key change, should reset to new first page not append', async () => {
    listPredictions.mockImplementation(async (filters?: PredictionFilters) => {
      if (filters?.topic === 'finance') {
        return [buildPrediction({ id: 'fin' })];
      }
      if (filters?.topic === 'tech') {
        return [buildPrediction({ id: 'tech' })];
      }
      return [];
    });

    const { result, rerender } = renderHook(
      ({ topic }: { topic?: string }) => {
        const filters = useMemo(
          () => ({
            status: 'all' as const,
            ...(topic !== undefined ? { topic } : {}),
          }),
          [topic],
        );
        return usePredictionFeed(filters, { pageSize: 20 });
      },
      { initialProps: { topic: 'finance' as string | undefined } },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data[0]?.id).toBe('fin');

    rerender({ topic: 'tech' });

    await waitFor(() => expect(result.current.data[0]?.id).toBe('tech'));

    expect(listPredictions).toHaveBeenLastCalledWith(
      { status: 'all', topic: 'tech', limit: 20, offset: 0 },
      expect.any(AbortSignal),
    );
  });

  test('given sort change, should reset to first page with new sort param', async () => {
    listPredictions.mockImplementation(async (filters?: PredictionFilters) => {
      if (filters?.sort === 'source_accuracy') {
        return [buildPrediction({ id: 'acc' })];
      }
      return [buildPrediction({ id: 'default' })];
    });

    const { result, rerender } = renderHook<
      UsePredictionFeedResult,
      { sort?: PredictionFilters['sort'] }
    >(({ sort }) => {
      const filters = useMemo(
        () => ({
          status: 'all' as const,
          ...(sort !== undefined && sort !== 'newest' ? { sort } : {}),
        }),
        [sort],
      );
      return usePredictionFeed(filters, { pageSize: 20 });
    }, { initialProps: { sort: 'newest' } });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data[0]?.id).toBe('default');

    rerender({ sort: 'source_accuracy' });

    await waitFor(() => expect(result.current.data[0]?.id).toBe('acc'));

    expect(listPredictions).toHaveBeenLastCalledWith(
      { status: 'all', sort: 'source_accuracy', limit: 20, offset: 0 },
      expect.any(AbortSignal),
    );
  });

  test('given refetch, should pass AbortSignal to listPredictions', async () => {
    listPredictions.mockResolvedValue([buildPrediction()]);

    const { result } = renderHook(() =>
      usePredictionFeed({ status: 'all' }, { pageSize: 20 }),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    listPredictions.mockClear();

    await act(async () => {
      listPredictions.mockResolvedValue([buildPrediction({ id: 'refetched' })]);
      await result.current.refetch();
    });

    expect(listPredictions).toHaveBeenCalledWith(
      { status: 'all', limit: 20, offset: 0 },
      expect.any(AbortSignal),
    );
    expect(result.current.data[0]?.id).toBe('refetched');
  });

  test('given enabled false, should skip fetch and stay idle', async () => {
    const { result } = renderHook(() =>
      usePredictionFeed({ status: 'all' }, { enabled: false }),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(listPredictions).not.toHaveBeenCalled();
    expect(result.current.data).toEqual([]);
    expect(result.current.hasMore).toBe(false);
  });

  test('given filter change while loadMore is in flight, should not append stale rows', async () => {
    const page1 = [
      buildPrediction({ id: '0' }),
      buildPrediction({ id: '1' }),
    ];
    const stalePage = [buildPrediction({ id: 'stale' })];
    const techPage = [buildPrediction({ id: 'tech' })];

    let resolveLoadMore: (value: ReturnType<typeof buildPrediction>[]) => void;
    const loadMoreDeferred = new Promise<ReturnType<typeof buildPrediction>[]>(
      (resolve) => {
        resolveLoadMore = resolve;
      },
    );

    listPredictions
      .mockResolvedValueOnce(page1)
      .mockImplementationOnce(() => loadMoreDeferred);

    const { result, rerender } = renderHook(
      ({ topic }: { topic?: string }) => {
        const filters = useMemo(
          () => ({
            status: 'all' as const,
            ...(topic !== undefined ? { topic } : {}),
          }),
          [topic],
        );
        return usePredictionFeed(filters, { pageSize: 2 });
      },
      { initialProps: { topic: 'finance' as string | undefined } },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toHaveLength(2);

    await act(async () => {
      void result.current.loadMore();
    });
    await waitFor(() => expect(result.current.loadingMore).toBe(true));

    listPredictions.mockResolvedValueOnce(techPage);
    rerender({ topic: 'tech' });

    await waitFor(() => expect(result.current.data[0]?.id).toBe('tech'));
    expect(result.current.data).toHaveLength(1);

    await act(async () => {
      resolveLoadMore!(stalePage);
      await loadMoreDeferred;
    });

    expect(result.current.data).toEqual(techPage);
    expect(result.current.data.some(p => p.id === 'stale')).toBe(false);
  });

  test('given enabled toggles true after prior fetch, should not show stale rows while loading', async () => {
    listPredictions
      .mockResolvedValueOnce([buildPrediction({ id: 'old' })])
      .mockResolvedValueOnce([buildPrediction({ id: 'new' })]);

    const { result, rerender } = renderHook(({ enabled }) => usePredictionFeed({ status: 'all', topic: 'tech' }, { enabled }), {
      initialProps: { enabled: true },
    });

    await waitFor(() => expect(result.current.data[0]?.id).toBe('old'));
    rerender({ enabled: false });
    expect(result.current.data).toEqual([]);

    rerender({ enabled: true });

    expect(result.current.data).toEqual([]);

    await waitFor(() => expect(result.current.data[0]?.id).toBe('new'));
  });

  test('given sort returns to newest, should refetch without sort param', async () => {
    listPredictions.mockImplementation(async (filters?: PredictionFilters) => {
      if (filters?.sort === 'recently_finished') {
        return [buildPrediction({ id: 'finished' })];
      }
      return [buildPrediction({ id: 'newest' })];
    });

    const { result, rerender } = renderHook<
      UsePredictionFeedResult,
      { sort?: PredictionFilters['sort']; topic?: string }
    >(({ sort, topic }) => {
      const filters = useMemo(
        () => ({
          status: 'all' as const,
          ...(topic !== undefined ? { topic } : {}),
          ...(sort !== undefined && sort !== 'newest' ? { sort } : {}),
        }),
        [sort, topic],
      );
      return usePredictionFeed(filters, { pageSize: 20 });
    }, { initialProps: { sort: 'newest', topic: 'politics' } });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data[0]?.id).toBe('newest');

    rerender({ sort: 'recently_finished', topic: 'politics' });

    await waitFor(() => expect(result.current.data[0]?.id).toBe('finished'));

    rerender({ sort: 'newest', topic: 'politics' });

    await waitFor(() => expect(result.current.data[0]?.id).toBe('newest'));

    expect(listPredictions).toHaveBeenLastCalledWith(
      { status: 'all', topic: 'politics', limit: 20, offset: 0 },
      expect.any(AbortSignal),
    );
    expect(listPredictions).toHaveBeenCalledTimes(3);
  });

  test('given filter change fetch fails, should set error, clear data, and set hasMore false', async () => {
    listPredictions
      .mockResolvedValueOnce([buildPrediction({ id: 'old' })])
      .mockRejectedValueOnce(new ApiError('Feed unavailable', 503));

    const { result, rerender } = renderHook(({ topic }: { topic?: string }) => {
      const filters = useMemo(() => (
        { status: 'all' as const,
          ...(topic !== undefined ? { topic } : {}) }), [topic]);
      return usePredictionFeed(filters, { pageSize: 20 });
    },
    { initialProps: { topic: 'finance' as string | undefined } },
    );

    await waitFor(() => expect(result.current.data[0]?.id).toBe('old'));

    rerender({ topic: 'tech' });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Feed unavailable');
    expect(result.current.data).toEqual([]);
    expect(result.current.hasMore).toBe(false);
  });

  test('given AbortError from listPredictions, should not set error', async () => {
    listPredictions.mockRejectedValue(new DOMException('The user aborted a request.', 'AbortError'));

    const { result } = renderHook(() => usePredictionFeed({ status: 'all' }, { pageSize: 20 }));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe(null);
  });

  test('given generic Error from listPredictions, should set generic error message', async () => {
    listPredictions.mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => usePredictionFeed({ status: 'all' }, { pageSize: 20 }));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Something went wrong');
    expect(result.current.data).toEqual([]);
    expect(result.current.hasMore).toBe(false);
  });

  test('given overlapping first-page fetches, should keep only the latest result', async () => {
    const firstFetch = createDeferred<Prediction[]>();
    const secondFetch = createDeferred<Prediction[]>();

    listPredictions
      .mockImplementationOnce(() => firstFetch.promise)
      .mockImplementationOnce(() => secondFetch.promise);

    const { result, rerender } = renderHook(({ topic }: { topic?: string }) => {
      const filters = useMemo(() => (
        { status: 'all' as const,
          ...(topic !== undefined ? { topic } : {}) }), [topic]);
      return usePredictionFeed(filters, { pageSize: 20 });
    }, { initialProps: { topic: 'finance' as string | undefined } });

    // First fetch started on mount, still pending
    await waitFor(() => expect(listPredictions).toHaveBeenCalledTimes(1));

    // Rapid second fetch from filter change
    rerender({ topic: 'tech' });
    await waitFor(() => expect(listPredictions).toHaveBeenCalledTimes(2));

    // Stale finance response arrives after tech fetch started
    await act(async () => {
      firstFetch.resolve([buildPrediction({ id: 'stale' })]);
      await Promise.resolve();
    });

    expect(result.current.data.some(p => p.id === 'stale')).toBe(false);

    // Latest (tech) response wins
    await act(async () => {
      secondFetch.resolve([buildPrediction({ id: 'fresh' })]);
    });

    await waitFor(() => expect(result.current.data[0]?.id).toBe('fresh'));
    expect(result.current.error).toBe(null);
    expect(result.current.loading).toBe(false);
  });

  test('given loading true, loadMore should be a no-op', async () => {
    const firstPage = createDeferred<Prediction[]>();
    listPredictions.mockImplementationOnce(() => firstPage.promise);

    const { result } = renderHook(() => usePredictionFeed({ status: 'all' }, { pageSize: 20 }));

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await result.current.loadMore();
    });

    expect(listPredictions).toHaveBeenCalledTimes(1); // only mount fetch, no loadMore

    await act(async () => {
      firstPage.resolve([buildPrediction({ id: 'a' }), buildPrediction({ id: 'b' })]);
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  test('given refetch fails after a full first page, should set error and hasMore false', async () => {
    const fullPage = Array.from({ length: 2 }, (_, i) => buildPrediction({ id: String(i) }));

    listPredictions
      .mockResolvedValueOnce(fullPage) // mount: full page => hasMore: true
      .mockRejectedValueOnce(new ApiError('Feed unavailable', 503)); // refetch fails: error => hasMore: false

    const { result } = renderHook(() => usePredictionFeed({ status: 'all' }, { pageSize: 2 }));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.hasMore).toBe(true);
    expect(result.current.data).toHaveLength(2);

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.error).toBe('Feed unavailable');
    expect(result.current.data).toEqual([]);
    expect(result.current.hasMore).toBe(false);
  });
});
