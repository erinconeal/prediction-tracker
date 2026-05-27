'use client';

import { useEffect, useState } from 'react';
import { listTopics, type TrendingTopicDto } from '@/services/api';
import { isAbortError } from '@/utils/is-abort-error';

type UseTrendingTopicsOptions = {
  bucket?: string;
  limit?: number;
  enabled?: boolean;
};

export function useTrendingTopics({
  bucket,
  limit = 6,
  enabled = true,
}: UseTrendingTopicsOptions = {}) {
  const [data, setData] = useState<TrendingTopicDto[]>([]);
  const [fetchLoading, setFetchLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const controller = new AbortController();

    async function loadTopics(): Promise<void> {
      setFetchLoading(true);
      setError(null);
      try {
        const rows = await listTopics({
          trending: true,
          bucket,
          limit,
          signal: controller.signal,
        });
        setData(rows as TrendingTopicDto[]);
      }
      catch (err: unknown) {
        if (isAbortError(err)) return;
        setError(err instanceof Error ? err.message : 'Failed to load topics');
        setData([]);
      }
      finally {
        if (!controller.signal.aborted) setFetchLoading(false);
      }
    }

    void loadTopics();

    return () => {
      controller.abort();
      setFetchLoading(false);
    };
  }, [bucket, limit, enabled]);

  const idle = !enabled;

  return {
    data: idle ? [] : data,
    loading: idle ? false : fetchLoading,
    error: idle ? null : error,
  };
}
