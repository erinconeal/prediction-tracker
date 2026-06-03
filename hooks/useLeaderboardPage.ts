'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { LeaderboardDisplayStats } from '@/lib/leaderboard-display';
import type { LeaderboardRow } from '@/lib/leaderboard';
import { loadLeaderboardPageWithOutcome } from '@/hooks/leaderboard-fetch';

const PAGE_SIZE = 50;

export type UseLeaderboardPageResult = {
  rows: LeaderboardRow[];
  total: number;
  rankedCount: number;
  showFullRankings: boolean;
  displayStats: LeaderboardDisplayStats | null;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
};

export function useLeaderboardPage(): UseLeaderboardPageResult {
  const firstPageGenRef = useRef(0);
  const loadMoreSeqRef = useRef(0);
  const loadMoreAbortRef = useRef<AbortController | null>(null);
  const refetchAbortRef = useRef<AbortController | null>(null);
  const rowsRef = useRef<LeaderboardRow[]>([]);

  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [total, setTotal] = useState(0);
  const [rankedCount, setRankedCount] = useState(0);
  const [showFullRankings, setShowFullRankings] = useState(false);
  const [displayStats, setDisplayStats] = useState<LeaderboardDisplayStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    rowsRef.current = rows;
  }, [rows]);

  useEffect(() => {
    const generation = ++firstPageGenRef.current;
    const controller = new AbortController();
    loadMoreAbortRef.current?.abort();

    async function loadFirstPage(): Promise<void> {
      setLoading(true);
      setLoadingMore(false);
      setError(null);
      const outcome = await loadLeaderboardPageWithOutcome({
        limit: PAGE_SIZE,
        offset: 0,
        signal: controller.signal,
      });
      if (firstPageGenRef.current !== generation) return;
      if (!outcome.ok) {
        if (outcome.aborted) return;
        setError(outcome.error);
        setRows([]);
        setTotal(0);
        setRankedCount(0);
        setShowFullRankings(false);
        setDisplayStats(null);
        setHasMore(false);
        setLoading(false);
        return;
      }
      setRows(outcome.page.rows);
      setTotal(outcome.page.total);
      setRankedCount(outcome.page.rankedCount);
      setShowFullRankings(outcome.page.showFullRankings);
      setDisplayStats(outcome.page.displayStats);
      setHasMore(outcome.page.hasMore);
      setLoading(false);
    }

    void loadFirstPage();

    return () => {
      controller.abort();
      refetchAbortRef.current?.abort();
      refetchAbortRef.current = null;
    };
  }, []);

  const refetch = useCallback(async (): Promise<void> => {
    const generation = ++firstPageGenRef.current;
    loadMoreAbortRef.current?.abort();
    refetchAbortRef.current?.abort();
    const controller = new AbortController();
    refetchAbortRef.current = controller;

    setLoading(true);
    setLoadingMore(false);
    setError(null);
    const outcome = await loadLeaderboardPageWithOutcome({
      limit: PAGE_SIZE,
      offset: 0,
      signal: controller.signal,
    });
    if (firstPageGenRef.current !== generation) return;
    if (!outcome.ok) {
      if (outcome.aborted) return;
      setError(outcome.error);
    }
    else {
      setRows(outcome.page.rows);
      setTotal(outcome.page.total);
      setRankedCount(outcome.page.rankedCount);
      setShowFullRankings(outcome.page.showFullRankings);
      setDisplayStats(outcome.page.displayStats);
      setHasMore(outcome.page.hasMore);
    }
    if (firstPageGenRef.current === generation) setLoading(false);
    if (refetchAbortRef.current === controller) {
      refetchAbortRef.current = null;
    }
  }, []);

  const loadMore = useCallback(async (): Promise<void> => {
    if (loadingMore || !hasMore) return;

    const seq = ++loadMoreSeqRef.current;
    loadMoreAbortRef.current?.abort();
    const controller = new AbortController();
    loadMoreAbortRef.current = controller;

    setLoadingMore(true);
    const outcome = await loadLeaderboardPageWithOutcome({
      limit: PAGE_SIZE,
      offset: rowsRef.current.length,
      signal: controller.signal,
    });
    if (loadMoreSeqRef.current !== seq) return;
    if (!outcome.ok) {
      if (outcome.aborted) return;
      setError(outcome.error);
      setLoadingMore(false);
      return;
    }

    const existing = new Set(rowsRef.current.map(r => r.sourceSlug));
    const appended = outcome.page.rows.filter(r => !existing.has(r.sourceSlug));
    setRows(prev => [...prev, ...appended]);
    setTotal(outcome.page.total);
    setRankedCount(outcome.page.rankedCount);
    setShowFullRankings(outcome.page.showFullRankings);
    setDisplayStats(outcome.page.displayStats);
    setHasMore(outcome.page.hasMore);
    setLoadingMore(false);
    if (loadMoreAbortRef.current === controller) {
      loadMoreAbortRef.current = null;
    }
  }, [hasMore, loadingMore]);

  return {
    rows,
    total,
    rankedCount,
    showFullRankings,
    displayStats,
    loading,
    loadingMore,
    error,
    hasMore,
    refetch,
    loadMore,
  };
}
