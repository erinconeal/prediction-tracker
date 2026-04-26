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

/** fetch(signal) aborts as DOMException or Error depending on runtime. */
function isAbortError(e: unknown): boolean {
  if (e instanceof DOMException && e.name === "AbortError") return true;
  if (e instanceof Error && e.name === "AbortError") return true;
  return false;
}

/**
 * Fetches predictions through the API service, tracks loading/error, caches the
 * last successful result per filter key (ref + Map) so revisiting the same
 * filters can show data immediately while a new request is in flight.
 */
export function usePredictions(filters: PredictionFilters): UsePredictionsResult {
  /*
   * Three pieces keep overlapping requests safe:
   * 1) fetchGenerationRef — incremented on every filter-driven effect run and on every
   *    refetch(); each async pass captures its number and only updates React state if
   *    that number is still the latest (stale responses are dropped).
   * 2) filterKey effect — owns a fresh AbortController per run; cleanup aborts the
   *    network call when the key changes or the component unmounts.
   * 3) refetchAbortRef — refetch() uses its own controller; a new refetch aborts the
   *    previous one, and a mount-only effect aborts on unmount (the filter effect does
   *    not cover manual refetches).
   */
  const filterKey = useMemo(() => getFilterKey(filters), [filters]);
  const cacheRef = useRef<Map<string, Prediction[]>>(new Map());
  /** Each effect run or refetch() bumps it so older async work ignores state updates. */
  const fetchGenerationRef = useRef(0);
  /** Latest manual refetch only; effect uses its own AbortController per run. */
  const refetchAbortRef = useRef<AbortController | null>(null);
  const [data, setData] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  /** Always read current filters inside async code (refetch may overlap a filter change). */
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Abort an in-flight refetch when the component unmounts (refetch has no effect cleanup).
  useEffect(() => {
    return () => {
      refetchAbortRef.current?.abort();
      refetchAbortRef.current = null;
    };
  }, []);

  // Fetch whenever the normalized filter key changes (not on every filters object identity).
  useEffect(() => {
    const generation = ++fetchGenerationRef.current;
    const controller = new AbortController();

    async function loadPredictionsForFilter(): Promise<void> {
      // Stale-while-revalidate: show cache for this key immediately if we have it.
      const cached = cacheRef.current.get(filterKey);
      if (cached) {
        setData(cached);
        setLoading(false);
      } else {
        setLoading(true);
      }
      setError(null);
      try {
        const result = await listPredictions(
          filtersRef.current,
          controller.signal,
        );
        // A newer effect run or refetch() bumped the ref; do not overwrite state.
        if (fetchGenerationRef.current !== generation) return;
        cacheRef.current.set(filterKey, result);
        setData(result);
      } catch (e: unknown) {
        if (isAbortError(e)) return;
        if (fetchGenerationRef.current !== generation) return;
        const message =
          e instanceof ApiError ? e.message : "Something went wrong";
        setError(message);
      } finally {
        // Only the newest generation clears loading (avoids races with aborted runs).
        if (fetchGenerationRef.current === generation) setLoading(false);
      }
    }

    void loadPredictionsForFilter();

    return () => controller.abort();
  }, [filterKey]);

  const refetch = useCallback(async (): Promise<void> => {
    // Invalidate any in-flight effect fetch for this hook instance (same generation ref).
    const generation = ++fetchGenerationRef.current;
    refetchAbortRef.current?.abort();
    const controller = new AbortController();
    refetchAbortRef.current = controller;

    const listKey = getFilterKey(filtersRef.current);
    const cached = cacheRef.current.get(listKey);
    if (cached) {
      setData(cached);
      setLoading(false);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const result = await listPredictions(
        filtersRef.current,
        controller.signal,
      );
      if (fetchGenerationRef.current !== generation) return;
      // Key after await: filters may have changed while the request was in flight.
      const appliedKey = getFilterKey(filtersRef.current);
      cacheRef.current.set(appliedKey, result);
      setData(result);
    } catch (e: unknown) {
      if (isAbortError(e)) return;
      if (fetchGenerationRef.current !== generation) return;
      const message =
        e instanceof ApiError ? e.message : "Something went wrong";
      setError(message);
    } finally {
      if (fetchGenerationRef.current === generation) setLoading(false);
      // Another refetch() may have replaced the controller; only clear if ours is still current.
      if (refetchAbortRef.current === controller) {
        refetchAbortRef.current = null;
      }
    }
  }, [filterKey]);

  return { data, loading, error, refetch };
}
