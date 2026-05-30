import '@/test/mocks/api-service';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useMemo } from 'react';
import { beforeEach, describe, expect, test } from 'vitest';
import type { PredictionFilters } from '@/types/prediction';
import { buildPrediction } from '@/test/factories/prediction';
import { listPredictions } from '@/test/mocks/api-service';
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
});
