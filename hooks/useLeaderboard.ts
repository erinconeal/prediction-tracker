"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, listLeaderboard } from "@/services/api";
import type { LeaderboardRow } from "@/lib/leaderboard";
import { isAbortError } from "@/utils/is-abort-error";

export type UseLeaderboardResult = {
  rows: LeaderboardRow[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useLeaderboard(limit = 10): UseLeaderboardResult {
  const genRef = useRef(0);
  const refetchAbortRef = useRef<AbortController | null>(null);
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const gen = ++genRef.current;
    const controller = new AbortController();

    async function load(): Promise<void> {
      setLoading(true);
      setError(null);
      try {
        const data = await listLeaderboard(limit, controller.signal);
        if (genRef.current !== gen) return;
        setRows(data);
      } catch (e: unknown) {
        if (isAbortError(e)) return;
        if (genRef.current !== gen) return;
        setError(e instanceof ApiError ? e.message : "Something went wrong");
        setRows([]);
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
  }, [limit]);

  const refetch = useCallback(async (): Promise<void> => {
    const gen = ++genRef.current;
    refetchAbortRef.current?.abort();
    const controller = new AbortController();
    refetchAbortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const data = await listLeaderboard(limit, controller.signal);
      if (genRef.current !== gen) return;
      setRows(data);
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
  }, [limit]);

  return { rows, loading, error, refetch };
}
