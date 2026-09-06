import '@/test/mocks/api-service';
import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test } from 'vitest';
import { createPrediction } from '@/test/mocks/api-service';
import { useCreatePrediction } from './useCreatePrediction';
import { buildPrediction } from '@/test/factories/prediction';
import type { CreatePredictionInput, Prediction } from '@/types/prediction';
import { createDeferred } from '@/test/helpers/deferred';
import { ApiError } from '@/services/api';

const input: CreatePredictionInput = {
  source: 'Bob',
  text: 'Stocks up',
  topicIds: ['topic-finance'],
  created_at: '2026-01-05T14:00:00.000Z',
  evidenceUrl: 'https://example.com/bob/stocks-up',
};
const secret = 'staff-secret';
const options = { staffSecret: secret };

describe('useCreatePrediction', () => {
  beforeEach(() => {
    createPrediction.mockReset();
  });

  test('given the create service returns a prediction, should expose it, clear loading, and return that row', async () => {
    const row = buildPrediction({ id: 'new' });

    const work = createDeferred<Prediction>();
    createPrediction.mockImplementation(() => work.promise);

    const { result } = renderHook(() => useCreatePrediction());

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.prediction).toBeNull();

    let pending!: Promise<Prediction | null>;

    act(() => {
      pending = result.current.create(input, options);
    });

    expect(result.current.loading).toBe(true);

    expect(createPrediction).toHaveBeenCalledWith(input, {
      signal: expect.any(AbortSignal),
      staffSecret: secret,
    });

    let created: Prediction | null = null;
    await act(async () => {
      work.resolve(row);
      created = await pending;
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.prediction).toEqual(row);
    expect(created).toEqual(row);
  });

  test('given the create service rejects with an API error, should surface that message and return no prediction', async () => {
    createPrediction.mockRejectedValue(new ApiError('Unauthorized', 401));

    const { result } = renderHook(() => useCreatePrediction());

    let created: Prediction | null = null;
    await act(async () => {
      created = await result.current.create(input, options);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Unauthorized');
    expect(result.current.prediction).toBeNull();
    expect(created).toBeNull();
  });

  test('given the create service throws an unexpected error, should set error to "Something went wrong" and return no prediction', async () => {
    createPrediction.mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => useCreatePrediction());

    let created: Prediction | null = null;
    await act(async () => {
      created = await result.current.create(input, options);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Something went wrong');
    expect(result.current.prediction).toBeNull();
    expect(created).toBeNull();
  });

  test('given the request is aborted, should not set error', async () => {
    createPrediction.mockRejectedValue(
      new DOMException('The user aborted a request.', 'AbortError'),
    );

    const { result } = renderHook(() => useCreatePrediction());

    let created: Prediction | null = null;
    await act(async () => {
      created = await result.current.create(input, options);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.prediction).toBeNull();
    expect(created).toBeNull();
  });

  test('given unmount while create is in flight, should abort the request and ignore the result', async () => {
    const work = createDeferred<Prediction>();
    let signal!: AbortSignal | undefined;
    createPrediction.mockImplementation((_input, options) => {
      signal = options.signal;
      return work.promise;
    });

    const { result, unmount } = renderHook(() => useCreatePrediction());

    let pending!: Promise<Prediction | null>;
    act(() => {
      pending = result.current.create(input, options);
    });

    expect(signal?.aborted).toBe(false);

    unmount();

    expect(signal?.aborted).toBe(true);

    let created: Prediction | null = null;
    await act(async () => {
      work.resolve(buildPrediction({ id: 'stale' }));
      created = await pending;
    });

    expect(created).toBeNull();
  });

  test('given a second create while the first is in flight, should abort the first and keep only the latest prediction', async () => {
    const first = createDeferred<Prediction>();
    const second = createDeferred<Prediction>();
    const stale = buildPrediction({ id: 'stale' });
    const fresh = buildPrediction({ id: 'fresh' });

    let firstSignal!: AbortSignal | undefined;
    createPrediction
      .mockImplementationOnce((_input, options) => {
        firstSignal = options.signal;
        return first.promise;
      })
      .mockImplementationOnce(() => second.promise);

    const { result } = renderHook(() => useCreatePrediction());

    let firstPending!: Promise<Prediction | null>;
    act(() => {
      firstPending = result.current.create(input, options);
    });

    expect(firstSignal?.aborted).toBe(false);
    expect(result.current.loading).toBe(true);

    let secondPending!: Promise<Prediction | null>;
    act(() => {
      secondPending = result.current.create(input, options);
    });

    expect(firstSignal?.aborted).toBe(true);
    expect(createPrediction).toHaveBeenCalledTimes(2);
    expect(result.current.loading).toBe(true);

    let firstCreated: Prediction | null = null;
    await act(async () => {
      first.resolve(stale);
      firstCreated = await firstPending;
    });

    expect(firstCreated).toBeNull();
    expect(result.current.prediction).toBeNull();
    expect(result.current.loading).toBe(true);

    let secondCreated: Prediction | null = null;
    await act(async () => {
      second.resolve(fresh);
      secondCreated = await secondPending;
    });

    expect(secondCreated).toEqual(fresh);
    expect(result.current.prediction).toEqual(fresh);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('given a second create starts while the first is failing, should ignore the first failure', async () => {
    let rejectFirst!: (reason: unknown) => void;
    const firstPromise = new Promise<Prediction>((_resolve, reject) => {
      rejectFirst = reject;
    });
    const second = createDeferred<Prediction>();
    const fresh = buildPrediction({ id: 'fresh' });

    createPrediction
      .mockImplementationOnce(() => firstPromise)
      .mockImplementationOnce(() => second.promise);

    const { result } = renderHook(() => useCreatePrediction());

    let firstPending!: Promise<Prediction | null>;
    act(() => {
      firstPending = result.current.create(input, options);
    });

    let secondPending!: Promise<Prediction | null>;
    act(() => {
      secondPending = result.current.create(input, options);
    });

    let firstCreated: Prediction | null = null;
    await act(async () => {
      rejectFirst(new ApiError('Unauthorized', 401));
      firstCreated = await firstPending;
    });

    expect(firstCreated).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(true);

    let secondCreated: Prediction | null = null;
    await act(async () => {
      second.resolve(fresh);
      secondCreated = await secondPending;
    });

    expect(secondCreated).toEqual(fresh);
    expect(result.current.prediction).toEqual(fresh);
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });
});
