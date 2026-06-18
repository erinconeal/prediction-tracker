'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ApiError, listPredictions } from '@/services/api';
import type { Prediction, PredictionFilters } from '@/types/prediction';
import { getFilterKey } from '@/utils/filter-key';
import { isAbortError } from '@/utils/is-abort-error';
import { toListRequestFilters } from '@/utils/list-request-filters';

export type UsePredictionFeedOptions = {
  /** Page size for each request (default 20). */
  pageSize?: number;
  /** When false, skips fetch and keeps an idle empty state (avoids duplicate list requests). */
  enabled?: boolean;
};

export type UsePredictionFeedResult = {
  data: Prediction[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
};

type FeedFilters = Omit<PredictionFilters, 'limit' | 'offset'>;

/**
 * Paginated home feed: first page loads on mount or when base filters change;
 * `loadMore` appends the next slice using server offset. Uses the same abort /
 * generation pattern as `usePredictions` to avoid stale updates.
 */
export function usePredictionFeed(
  filters: FeedFilters,
  options: UsePredictionFeedOptions = {},
): UsePredictionFeedResult {
  const pageSize = options.pageSize ?? 20;
  const enabled = options.enabled ?? true;
  const baseKey = useMemo(
    () => getFilterKey({ ...filters, limit: undefined, offset: undefined }),
    [filters],
  );
  /** Async code reads filtersRef.current so a slow request still uses the filters that were current when it started. */
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  /** Bumps on filter change and refetch so first-page fetches ignore stale responses. */
  const firstPageGenRef = useRef(0);
  /** Monotonic id so overlapping load-more responses are dropped. */
  const loadMoreSeqRef = useRef(0);
  const loadMoreAbortRef = useRef<AbortController | null>(null);
  const refetchAbortRef = useRef<AbortController | null>(null);
  /** Mirrors `data` for `loadMore` offset without relying on a state-updater side effect. */
  const dataRef = useRef<Prediction[]>([]);

  const [data, setData] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    if (!enabled) {
      firstPageGenRef.current += 1;
      loadMoreSeqRef.current += 1;
      loadMoreAbortRef.current?.abort();
      return;
    }

    firstPageGenRef.current += 1;
    loadMoreSeqRef.current += 1;
    const generation = firstPageGenRef.current;
    const controller = new AbortController();
    loadMoreAbortRef.current?.abort();
    const requestFilters = toListRequestFilters(filtersRef.current);

    async function loadFirstPage(): Promise<void> {
      setLoading(true);
      setLoadingMore(false);
      setError(null);
      setHasMore(true);
      setData([]);
      dataRef.current = [];

      try {
        const result = await listPredictions(
          {
            ...requestFilters,
            limit: pageSize,
            offset: 0,
          },
          controller.signal,
        );
        if (firstPageGenRef.current !== generation) return; // A newer effect run or refetch() bumped the ref; do not overwrite state.
        setData(result);
        setHasMore(result.length === pageSize);
      }
      catch (e: unknown) {
        if (isAbortError(e)) return;
        if (firstPageGenRef.current !== generation) return;
        const message
          = e instanceof ApiError ? e.message : 'Something went wrong';
        setError(message);
        setData([]);
        setHasMore(false);
      }
      finally {
        if (firstPageGenRef.current === generation) setLoading(false);
      }
    }

    void loadFirstPage();

    return () => {
      controller.abort();
      loadMoreAbortRef.current?.abort();
      refetchAbortRef.current?.abort();
    };
  }, [baseKey, pageSize, enabled]);

  useEffect(() => {
    return () => {
      loadMoreAbortRef.current?.abort();
      loadMoreAbortRef.current = null;
      refetchAbortRef.current?.abort();
      refetchAbortRef.current = null;
    };
  }, []);

  const refetch = useCallback(async (): Promise<void> => {
    if (!enabled) return;
    firstPageGenRef.current += 1;
    loadMoreSeqRef.current += 1;
    const generation = firstPageGenRef.current;
    loadMoreAbortRef.current?.abort();
    loadMoreAbortRef.current = null;
    refetchAbortRef.current?.abort();
    const controller = new AbortController();
    refetchAbortRef.current = controller;

    setLoading(true);
    setLoadingMore(false);
    setError(null);
    setData([]);
    dataRef.current = [];

    const requestFilters = toListRequestFilters(filtersRef.current);

    try {
      const result = await listPredictions(
        {
          ...requestFilters,
          limit: pageSize,
          offset: 0,
        },
        controller.signal,
      );
      if (firstPageGenRef.current !== generation) return;
      setData(result);
      setHasMore(result.length === pageSize);
    }
    catch (e: unknown) {
      if (isAbortError(e)) return;
      if (firstPageGenRef.current !== generation) return;
      const message
        = e instanceof ApiError ? e.message : 'Something went wrong';
      setError(message);
    }
    finally {
      if (firstPageGenRef.current === generation) setLoading(false);
      if (refetchAbortRef.current === controller) {
        refetchAbortRef.current = null;
      }
    }
  }, [pageSize, enabled]);

  const loadMore = useCallback(async (): Promise<void> => {
    if (!enabled || !hasMore || loading || loadingMore) return;

    loadMoreSeqRef.current += 1;
    const seq = loadMoreSeqRef.current;
    loadMoreAbortRef.current?.abort();
    const controller = new AbortController();
    loadMoreAbortRef.current = controller;

    setLoadingMore(true);
    setError(null);
    const offset = dataRef.current.length;
    const requestFilters = toListRequestFilters(filtersRef.current);
    try {
      const page = await listPredictions(
        {
          ...requestFilters,
          limit: pageSize,
          offset,
        },
        controller.signal,
      );
      if (seq !== loadMoreSeqRef.current) return; // A newer loadMore() bumped the ref; do not overwrite state.
      setData((prev) => {
        const seen = new Set(prev.map(p => p.id));
        const merged = [...prev];
        for (const p of page) {
          if (!seen.has(p.id)) {
            seen.add(p.id);
            merged.push(p);
          }
        }
        return merged;
      });
      setHasMore(page.length === pageSize);
    }
    catch (e: unknown) {
      if (isAbortError(e)) return;
      if (seq !== loadMoreSeqRef.current) return; // A newer loadMore() bumped the ref; do not overwrite state.
      const message
        = e instanceof ApiError ? e.message : 'Something went wrong';
      setError(message);
    }
    finally {
      if (seq === loadMoreSeqRef.current) setLoadingMore(false);
      if (loadMoreAbortRef.current === controller) {
        loadMoreAbortRef.current = null;
      }
    }
  }, [enabled, hasMore, loading, loadingMore, pageSize]);

  const idle = !enabled;

  return {
    data: idle ? [] : data,
    loading: idle ? false : loading,
    loadingMore: idle ? false : loadingMore,
    error: idle ? null : error,
    hasMore: idle ? false : hasMore,
    refetch,
    loadMore,
  };
}
