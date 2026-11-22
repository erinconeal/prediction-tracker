import '@/test/mocks/api-service';

import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test } from 'vitest';

import { ApiError } from '@/services/api';
import { buildPrediction } from '@/test/factories/prediction';
import { createDeferred } from '@/test/helpers/deferred';
import { updatePrediction } from '@/test/mocks/api-service';
import type { Prediction } from '@/types/prediction';

import { useUpdatePrediction } from './useUpdatePrediction';

describe('useUpdatePrediction', () => {
  beforeEach(() => {
    updatePrediction.mockReset();
  });

  test('given the update service returns a prediction, should expose it, clear loading, and return that row', async () => {
    const row = buildPrediction({ id: 'pred-1', outcome: 'correct' });

    const work = createDeferred<Prediction>();
    updatePrediction.mockImplementation(() => work.promise);

    const { result } = renderHook(() => useUpdatePrediction());

    let pending!: Promise<Prediction | null>;
    await act(async () => {
      pending = result.current.update('pred-1', 'correct', { staffSecret: 'staff-secret', resolutionUrl: 'https://example.com/source' });
    });

    expect(result.current.loading).toBe(true);

    expect(updatePrediction).toHaveBeenCalledWith('pred-1', 'correct', {
      signal: expect.any(AbortSignal),
      staffSecret: 'staff-secret',
      resolutionUrl: 'https://example.com/source',
    });

    let updated: Prediction | null = null;
    await act(async () => {
      work.resolve(row);
      updated = await pending;
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.updatedRow).toEqual(row);
    expect(updated).toEqual(row);
  });

  test('given the update service returns an error, should expose it, clear loading, and return null', async () => {
    updatePrediction.mockRejectedValue(new ApiError('Unauthorized', 401));

    const { result } = renderHook(() => useUpdatePrediction());

    await act(async () => {
      result.current.update('pred-1', 'correct', { staffSecret: 'staff-secret', resolutionUrl: 'https://example.com/source' });
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Unauthorized');
    expect(result.current.updatedRow).toBeNull();
  });

  test('given the update service aborts, should clear loading, error, and prediction', async () => {
    updatePrediction.mockRejectedValue(
      new DOMException('The user aborted a request.', 'AbortError'),
    );

    const { result } = renderHook(() => useUpdatePrediction());

    await act(async () => {
      result.current.update('pred-1', 'correct', { staffSecret: 'staff-secret', resolutionUrl: 'https://example.com/source' });
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.updatedRow).toBeNull();
  });

  test('given a newer update, should abort the in-flight update', async () => {
    const first = createDeferred<Prediction>();
    const second = createDeferred<Prediction>();
    const stale = buildPrediction({ id: 'stale' });
    const fresh = buildPrediction({ id: 'fresh' });

    let firstSignal!: AbortSignal | undefined;
    updatePrediction
      .mockImplementationOnce((_id, _outcome, options) => {
        firstSignal = options.signal;
        return first.promise;
      })
      .mockImplementationOnce(() => second.promise);

    const { result } = renderHook(() => useUpdatePrediction());

    let firstPending!: Promise<Prediction | null>;
    await act(async () => {
      firstPending = result.current.update('pred-1', 'correct', { staffSecret: 'staff-secret', resolutionUrl: 'https://example.com/source' });
    });

    expect(firstSignal?.aborted).toBe(false);
    expect(result.current.loading).toBe(true);

    let secondPending!: Promise<Prediction | null>;
    await act(async () => {
      secondPending = result.current.update('pred-1', 'correct', { staffSecret: 'staff-secret', resolutionUrl: 'https://example.com/source' });
    });

    expect(firstSignal?.aborted).toBe(true);
    expect(updatePrediction).toHaveBeenCalledTimes(2);
    expect(result.current.loading).toBe(true);

    let firstUpdated: Prediction | null = null;
    await act(async () => {
      first.resolve(stale);
      firstUpdated = await firstPending;
    });

    expect(firstUpdated).toBeNull();
    expect(result.current.updatedRow).toBeNull();
    expect(result.current.loading).toBe(true);

    let secondUpdated: Prediction | null = null;
    await act(async () => {
      second.resolve(fresh);
      secondUpdated = await secondPending;
    });

    expect(secondUpdated).toEqual(fresh);
    expect(result.current.updatedRow).toEqual(fresh);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
