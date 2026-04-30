"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ApiError, listPredictions } from "@/services/api";
import type { Prediction, PredictionFilters } from "@/types/prediction";
import { getFilterKey } from "@/utils/filter-key";
import { isAbortError } from "@/utils/is-abort-error";

export type UsePredictionFeedOptions = {
  /** Page size for each request (default 20). */
  pageSize?: number;
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

type FeedFilters = Omit<PredictionFilters, "limit" | "offset">;

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
  const baseKey = useMemo(
    () => getFilterKey({ ...filters, limit: undefined, offset: undefined }),
    [filters],
  );
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
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  useEffect(() => {
    const generation = ++firstPageGenRef.current;
    const controller = new AbortController();
    loadMoreAbortRef.current?.abort();

    async function loadFirstPage(): Promise<void> {
      setLoading(true);
      setLoadingMore(false);
      setError(null);
      setHasMore(true);
      try {
        const result = await listPredictions(
          {
            ...filtersRef.current,
            limit: pageSize,
            offset: 0,
          },
          controller.signal,
        );
        if (firstPageGenRef.current !== generation) return;
        setData(result);
        setHasMore(result.length === pageSize);
      } catch (e: unknown) {
        if (isAbortError(e)) return;
        if (firstPageGenRef.current !== generation) return;
        const message =
          e instanceof ApiError ? e.message : "Something went wrong";
        setError(message);
        setData([]);
        setHasMore(false);
      } finally {
        if (firstPageGenRef.current === generation) setLoading(false);
      }
    }

    void loadFirstPage();

    return () => {
      controller.abort();
      loadMoreAbortRef.current?.abort();
      refetchAbortRef.current?.abort();
    };
  }, [baseKey, pageSize]);

  useEffect(() => {
    return () => {
      loadMoreAbortRef.current?.abort();
      loadMoreAbortRef.current = null;
      refetchAbortRef.current?.abort();
      refetchAbortRef.current = null;
    };
  }, []);

  const refetch = useCallback(async (): Promise<void> => {
    const generation = ++firstPageGenRef.current;
    loadMoreAbortRef.current?.abort();
    loadMoreAbortRef.current = null;
    refetchAbortRef.current?.abort();
    const controller = new AbortController();
    refetchAbortRef.current = controller;

    setLoading(true);
    setLoadingMore(false);
    setError(null);
    try {
      const result = await listPredictions(
        {
          ...filtersRef.current,
          limit: pageSize,
          offset: 0,
        },
        controller.signal,
      );
      if (firstPageGenRef.current !== generation) return;
      setData(result);
      setHasMore(result.length === pageSize);
    } catch (e: unknown) {
      if (isAbortError(e)) return;
      if (firstPageGenRef.current !== generation) return;
      const message =
        e instanceof ApiError ? e.message : "Something went wrong";
      setError(message);
    } finally {
      if (firstPageGenRef.current === generation) setLoading(false);
      if (refetchAbortRef.current === controller) {
        refetchAbortRef.current = null;
      }
    }
  }, [pageSize]);

  const loadMore = useCallback(async (): Promise<void> => {
    if (!hasMore || loading || loadingMore) return;

    const seq = ++loadMoreSeqRef.current;
    loadMoreAbortRef.current?.abort();
    const controller = new AbortController();
    loadMoreAbortRef.current = controller;

    setLoadingMore(true);
    setError(null);
    const offset = dataRef.current.length;
    try {
      const page = await listPredictions(
        {
          ...filtersRef.current,
          limit: pageSize,
          offset,
        },
        controller.signal,
      );
      if (seq !== loadMoreSeqRef.current) return;
      setData((prev) => {
        const seen = new Set(prev.map((p) => p.id));
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
    } catch (e: unknown) {
      if (isAbortError(e)) return;
      if (seq !== loadMoreSeqRef.current) return;
      const message =
        e instanceof ApiError ? e.message : "Something went wrong";
      setError(message);
    } finally {
      if (seq === loadMoreSeqRef.current) setLoadingMore(false);
      if (loadMoreAbortRef.current === controller) {
        loadMoreAbortRef.current = null;
      }
    }
  }, [hasMore, loading, loadingMore, pageSize]);

  return {
    data,
    loading,
    loadingMore,
    error,
    hasMore,
    refetch,
    loadMore,
  };
}
