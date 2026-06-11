'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { LeaderboardDisplayStats } from '@/lib/leaderboard-display';
import type { LeaderboardRow } from '@/lib/leaderboard';
import { loadLeaderboardPageWithOutcome } from '@/services/leaderboard-fetch';

export type UseLeaderboardResult = {
  rows: LeaderboardRow[];
  rankedCount: number | null;
  showFullRankings: boolean;
  displayStats: LeaderboardDisplayStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useLeaderboard(limit = 10): UseLeaderboardResult {
  const genRef = useRef(0);
  const refetchAbortRef = useRef<AbortController | null>(null);
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [rankedCount, setRankedCount] = useState<number | null>(null);
  const [showFullRankings, setShowFullRankings] = useState(false);
  const [displayStats, setDisplayStats] = useState<LeaderboardDisplayStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    genRef.current += 1;
    const gen = genRef.current;
    const controller = new AbortController();

    async function load(): Promise<void> {
      setLoading(true);
      setError(null);
      const outcome = await loadLeaderboardPageWithOutcome({
        limit,
        offset: 0,
        signal: controller.signal,
      });
      if (genRef.current !== gen) return;
      if (!outcome.ok) {
        if (outcome.aborted) return;
        setError(outcome.error);
        setRows([]);
        setRankedCount(null);
        setShowFullRankings(false);
        setDisplayStats(null);
        setLoading(false);
        return;
      }
      setRows(outcome.page.rows);
      setRankedCount(outcome.page.rankedCount);
      setShowFullRankings(outcome.page.showFullRankings);
      setDisplayStats(outcome.page.displayStats);
      setLoading(false);
    }

    void load();

    return () => {
      controller.abort();
      refetchAbortRef.current?.abort();
      refetchAbortRef.current = null;
    };
  }, [limit]);

  const refetch = useCallback(async (): Promise<void> => {
    genRef.current += 1;
    const gen = genRef.current;
    refetchAbortRef.current?.abort();
    const controller = new AbortController();
    refetchAbortRef.current = controller;

    setLoading(true);
    setError(null);
    const outcome = await loadLeaderboardPageWithOutcome({
      limit,
      offset: 0,
      signal: controller.signal,
    });
    if (genRef.current !== gen) return;
    if (!outcome.ok) {
      if (outcome.aborted) return;
      setError(outcome.error);
    }
    else {
      setRows(outcome.page.rows);
      setRankedCount(outcome.page.rankedCount);
      setShowFullRankings(outcome.page.showFullRankings);
      setDisplayStats(outcome.page.displayStats);
    }
    if (genRef.current === gen) setLoading(false);
    if (refetchAbortRef.current === controller) {
      refetchAbortRef.current = null;
    }
  }, [limit]);

  return {
    rows,
    rankedCount,
    showFullRankings,
    displayStats,
    loading,
    error,
    refetch,
  };
}
