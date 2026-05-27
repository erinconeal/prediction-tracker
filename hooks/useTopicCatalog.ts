'use client';

import { useSyncExternalStore } from 'react';
import {
  getTopicsByIds as getTopicsByIdsFromStore,
  listTopics as listTopicsFromStore,
} from '@/lib/topic-store';
import { pickPrimaryTopicFromLinked } from '@/lib/topic-primary';
import { listTopics } from '@/services/api';
import type { Topic } from '@/types/topic';
import { isAbortError } from '@/utils/is-abort-error';

let sharedCatalog: Topic[] | null = null;
let sharedCatalogPromise: Promise<Topic[]> | null = null;
let seedCatalogSnapshot: Topic[] | null = null;
let catalogLoadStarted = false;
const catalogListeners = new Set<() => void>();

/** Clears the in-memory catalog cache (tests only). */
export function resetTopicCatalogCacheForTests(): void {
  sharedCatalog = null;
  sharedCatalogPromise = null;
  seedCatalogSnapshot = null;
  catalogLoadStarted = false;
}

function notifyTopicCatalogListeners(): void {
  for (const listener of catalogListeners) {
    listener();
  }
}

function subscribeToTopicCatalog(onStoreChange: () => void): () => void {
  catalogListeners.add(onStoreChange);
  ensureTopicCatalogLoaded();
  return () => {
    catalogListeners.delete(onStoreChange);
  };
}

async function runTopicCatalogLoad(): Promise<void> {
  try {
    await loadSharedCatalog();
    notifyTopicCatalogListeners();
  }
  catch (err: unknown) {
    if (!isAbortError(err)) {
      notifyTopicCatalogListeners();
    }
  }
}

function ensureTopicCatalogLoaded(): void {
  if (sharedCatalog || catalogLoadStarted) return;
  catalogLoadStarted = true;
  void runTopicCatalogLoad();
}

function getTopicCatalogSnapshot(): Topic[] {
  if (sharedCatalog) return sharedCatalog;
  seedCatalogSnapshot ??= listTopicsFromStore();
  return seedCatalogSnapshot;
}

function getTopicCatalogLoadingSnapshot(): boolean {
  return sharedCatalog === null;
}

function getTopicCatalogLoadingServerSnapshot(): boolean {
  return false;
}

async function fetchSharedCatalog(signal?: AbortSignal): Promise<Topic[]> {
  try {
    const rows = await listTopics({ signal });
    sharedCatalog = rows as Topic[];
    return sharedCatalog;
  }
  catch (err: unknown) {
    if (isAbortError(err)) throw err;
    sharedCatalog = listTopicsFromStore();
    return sharedCatalog;
  }
}

function loadSharedCatalog(signal?: AbortSignal): Promise<Topic[]> {
  if (sharedCatalog) return Promise.resolve(sharedCatalog);
  if (!sharedCatalogPromise) {
    sharedCatalogPromise = fetchSharedCatalog(signal);
  }
  return sharedCatalogPromise;
}

/**
 * Client-side topic lookup for chips and labels. Resolves IDs synchronously from
 * the seeded topic store; optionally refreshes the shared catalog from the API.
 */
export function useTopicCatalog(): {
  topics: Topic[];
  loading: boolean;
  getTopicsByIds: (ids: string[]) => Topic[];
  getPrimaryTopicForPrediction: (ids: string[]) => Topic | null;
  getParentBucketTopics: (topic: Topic) => Topic[];
} {
  const topics = useSyncExternalStore(
    subscribeToTopicCatalog,
    getTopicCatalogSnapshot,
    getTopicCatalogSnapshot,
  );
  const loading = useSyncExternalStore(
    subscribeToTopicCatalog,
    getTopicCatalogLoadingSnapshot,
    getTopicCatalogLoadingServerSnapshot,
  );

  const getTopicsByIds = (ids: string[]) => getTopicsByIdsFromStore(ids);

  const getPrimaryTopicForPrediction = (ids: string[]) => {
    const linked = getTopicsByIds(ids);
    return pickPrimaryTopicFromLinked(linked);
  };

  const getParentBucketTopics = (topic: Topic) => {
    if (topic.kind !== 'curated') return [];
    return getTopicsByIds(topic.parentTopicIds).filter(t => t.kind === 'bucket');
  };

  return {
    topics,
    loading,
    getTopicsByIds,
    getPrimaryTopicForPrediction,
    getParentBucketTopics,
  };
}
