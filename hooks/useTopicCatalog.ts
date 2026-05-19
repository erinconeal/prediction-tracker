"use client";

import { useEffect, useState } from "react";
import { listTopics } from "@/services/api";
import type { Topic } from "@/types/topic";
import { isAbortError } from "@/utils/is-abort-error";

let sharedCatalog: Topic[] | null = null;
let sharedCatalogPromise: Promise<Topic[]> | null = null;

/** Clears the in-memory catalog cache (tests only). */
export function resetTopicCatalogCacheForTests(): void {
  sharedCatalog = null;
  sharedCatalogPromise = null;
}

function loadSharedCatalog(signal?: AbortSignal): Promise<Topic[]> {
  if (sharedCatalog) return Promise.resolve(sharedCatalog);
  if (!sharedCatalogPromise) {
    sharedCatalogPromise = listTopics({ signal }).then((rows) => {
      sharedCatalog = rows as Topic[];
      return sharedCatalog;
    });
  }
  return sharedCatalogPromise;
}

/**
 * Client-side topic lookup for chips and labels. Loads once via the topics API.
 */
export function useTopicCatalog(): {
  topics: Topic[];
  loading: boolean;
  getTopicsByIds: (ids: string[]) => Topic[];
} {
  const [topics, setTopics] = useState<Topic[]>(() => sharedCatalog ?? []);
  const [loading, setLoading] = useState(() => sharedCatalog === null);

  useEffect(() => {
    if (sharedCatalog) return;

    const controller = new AbortController();
    void loadSharedCatalog(controller.signal)
      .then((rows) => {
        if (!controller.signal.aborted) setTopics(rows);
      })
      .catch((err: unknown) => {
        if (isAbortError(err)) return;
        setTopics([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const getTopicsByIds = (ids: string[]) => {
    if (ids.length === 0) return [];
    const set = new Set(ids);
    return topics.filter((t) => set.has(t.id));
  };

  return { topics, loading, getTopicsByIds };
}
