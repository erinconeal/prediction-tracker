"use client";

import { useEffect, useState } from "react";
import { listTopics, type TrendingTopicDto } from "@/services/api";
import { isAbortError } from "@/utils/is-abort-error";

type UseTrendingTopicsOptions = {
  category?: string;
  limit?: number;
  enabled?: boolean;
};

export function useTrendingTopics({
  category,
  limit = 6,
  enabled = true,
}: UseTrendingTopicsOptions = {}) {
  const [data, setData] = useState<TrendingTopicDto[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError(null);

    async function loadTopics(): Promise<void> {
      try {
        const rows = await listTopics({
          trending: true,
          category,
          limit,
          signal: controller.signal,
        });
        setData(rows as TrendingTopicDto[]);
      } catch (err: unknown) {
        if (isAbortError(err)) return;
        setError(err instanceof Error ? err.message : "Failed to load topics");
        setData([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadTopics();

    return () => controller.abort();
  }, [category, limit, enabled]);

  return { data, loading, error };
}
