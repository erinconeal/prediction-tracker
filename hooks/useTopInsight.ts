"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, getTopInsight } from "@/services/api";
import type { Insight } from "@/lib/insights";
import { isAbortError } from "@/utils/is-abort-error";

export type UseTopInsightResult = {
  insight: Insight | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

/**
 * Fetches the single most-interesting insight (`/api/insights`) on mount.
 * Mirrors `useLeaderboard`: a generation counter + AbortController guard
 * prevents stale results from a superseded request from clobbering newer state.
 */
export function useTopInsight(): UseTopInsightResult {
  const genRef = useRef(0);
  const refetchAbortRef = useRef<AbortController | null>(null);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const gen = ++genRef.current;
    const controller = new AbortController();

    async function load(): Promise<void> {
      setLoading(true);
      setError(null);
      try {
        const data = await getTopInsight(controller.signal);
        if (genRef.current !== gen) return;
        setInsight(data);
      } catch (e: unknown) {
        if (isAbortError(e)) return;
        if (genRef.current !== gen) return;
        setError(e instanceof ApiError ? e.message : "Something went wrong");
        setInsight(null);
      } finally {
        if (genRef.current === gen) setLoading(false);
      }
    }

    void load();

    return () => {
      controller.abort();
      refetchAbortRef.current?.abort();
      refetchAbortRef.current = null;
    };
  }, []);

  const refetch = useCallback(async (): Promise<void> => {
    const gen = ++genRef.current;
    refetchAbortRef.current?.abort();
    const controller = new AbortController();
    refetchAbortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const data = await getTopInsight(controller.signal);
      if (genRef.current !== gen) return;
      setInsight(data);
    } catch (e: unknown) {
      if (isAbortError(e)) return;
      if (genRef.current !== gen) return;
      setError(e instanceof ApiError ? e.message : "Something went wrong");
    } finally {
      if (genRef.current === gen) setLoading(false);
      if (refetchAbortRef.current === controller) {
        refetchAbortRef.current = null;
      }
    }
  }, []);

  return { insight, loading, error, refetch };
}
