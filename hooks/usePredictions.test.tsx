import '@/test/mocks/api-service';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useMemo } from 'react';
import { beforeEach, describe, expect, test } from 'vitest';
import type { Prediction, PredictionFilters } from '@/types/prediction';
import { ApiError } from '@/services/api';
import { buildPrediction } from '@/test/factories/prediction';
import { createDeferred } from '@/test/helpers/deferred';
import { listPredictions } from '@/test/mocks/api-service';
import { usePredictions } from './usePredictions';

describe('usePredictions', () => {
  beforeEach(() => {
    listPredictions.mockReset();
  });

  test('given successful listPredictions, should expose data and clear loading', async () => {
    const row = buildPrediction();
    listPredictions.mockResolvedValue([row]);

    const { result } = renderHook(() => usePredictions({}));

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual([row]);
    expect(result.current.error).toBe(null);
    expect(listPredictions).toHaveBeenCalledWith(
      {},
      expect.any(AbortSignal),
    );
  });

  test('given ApiError from listPredictions, should set error and stop loading', async () => {
    listPredictions.mockRejectedValue(new ApiError('Server broke', 500));

    const { result } = renderHook(() => usePredictions({}));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Server broke');
    expect(result.current.data).toEqual([]);
  });

  test('given AbortError from listPredictions, should not set error', async () => {
    listPredictions.mockRejectedValue(
      new DOMException('The user aborted a request.', 'AbortError'),
    );

    const { result } = renderHook(() => usePredictions({}));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe(null);
  });

  test('given stale effect result after refetch bumps generation, should ignore stale data', async () => {
    const effectWork = createDeferred<Prediction[]>();
    const refetchWork = createDeferred<Prediction[]>();

    listPredictions
      .mockImplementationOnce(() => effectWork.promise)
      .mockImplementationOnce(() => refetchWork.promise);

    const { result } = renderHook(() => usePredictions({}));

    await waitFor(() => expect(listPredictions).toHaveBeenCalledTimes(1));

    const refetchDone = result.current.refetch();
    await waitFor(() => expect(listPredictions).toHaveBeenCalledTimes(2));

    await act(async () => {
      effectWork.resolve([buildPrediction({ id: 'stale', text: 'old' })]);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.data.some(p => p.id === 'stale')).toBe(false);

    await act(async () => {
      refetchWork.resolve([buildPrediction({ id: 'fresh', text: 'new' })]);
    });

    await waitFor(() =>
      expect(result.current.data.some(p => p.id === 'fresh')).toBe(true),
    );

    expect(result.current.error).toBe(null);
    expect(result.current.loading).toBe(false);

    await act(async () => {
      await refetchDone;
    });
  });

  test('given refetch after success, should pass current filters to listPredictions', async () => {
    listPredictions.mockResolvedValue([buildPrediction()]);

    const { result, rerender } = renderHook(
      ({ source }: { source: string }) => {
        const filters: PredictionFilters = useMemo(
          () => ({ source, status: 'all' }),
          [source],
        );
        return usePredictions(filters);
      },
      { initialProps: { source: 'A' } },
    );

    await waitFor(() => {
      expect(result.current).not.toBeNull();
      expect(result.current.loading).toBe(false);
    });

    listPredictions.mockResolvedValue([buildPrediction({ id: 'b' })]);
    rerender({ source: 'B' });

    await waitFor(() =>
      expect(listPredictions).toHaveBeenLastCalledWith(
        { source: 'B', status: 'all' },
        expect.any(AbortSignal),
      ),
    );

    await act(async () => {
      await result.current.refetch();
    });

    expect(listPredictions).toHaveBeenLastCalledWith(
      { source: 'B', status: 'all' },
      expect.any(AbortSignal),
    );
  });
});
