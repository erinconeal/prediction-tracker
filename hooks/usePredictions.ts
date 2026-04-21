"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ApiError, listPredictions } from "@/services/api";
import type { Prediction, PredictionFilters } from "@/types/prediction";
import { getFilterKey } from "@/utils/filter-key";

export type UsePredictionsResult = {
  data: Prediction[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

function isAbortError(e: unknown): boolean {
  return e instanceof DOMException && e.name === "AbortError";
}

/**
 * Fetches predictions through the API service, tracks loading/error, caches the
 * last successful result per filter key (ref + Map) so revisiting the same
 * filters can show data immediately while a new request is in flight.
 */
export function usePredictions(filters: PredictionFilters): UsePredictionsResult {
  const filterKey = useMemo(() => getFilterKey(filters), [filters]);
  const cacheRef = useRef<Map<string, Prediction[]>>(new Map());
  const [data, setData] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const runFetch = useCallback(
    async (signal: AbortSignal) => {
      const cached = cacheRef.current.get(filterKey);
      if (cached) {
        setData(cached);
        setLoading(false);
      } else {
        setLoading(true);
      }
      setError(null);
      try {
        const result = await listPredictions(filtersRef.current, signal);
        if (signal.aborted) return;
        cacheRef.current.set(filterKey, result);
        setData(result);
      } catch (e: unknown) {
        if (isAbortError(e)) return;
        const message =
          e instanceof ApiError ? e.message : "Something went wrong";
        setError(message);
      } finally {
        if (!signal.aborted) setLoading(false);
      }
    },
    [filterKey],
  );

  useEffect(() => {
    const controller = new AbortController();
    void runFetch(controller.signal);
    return () => controller.abort();
  }, [filterKey, runFetch]);

  const refetch = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const result = await listPredictions(filtersRef.current);
      cacheRef.current.set(filterKey, result);
      setData(result);
    } catch (e: unknown) {
      const message =
        e instanceof ApiError ? e.message : "Something went wrong";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [filterKey]);

  return { data, loading, error, refetch };
}
