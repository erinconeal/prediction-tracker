'use client';

import { useSyncExternalStore } from 'react';
import { pickPrimaryTopicFromLinked } from '@/lib/topic-primary';
import { listTopics } from '@/services/api';
import type { Topic } from '@/types/topic';
import { isAbortError } from '@/utils/is-abort-error';

let sharedCatalog: Topic[] | null = null;
let sharedCatalogPromise: Promise<Topic[]> | null = null;
let catalogLoadStarted = false;
const catalogListeners = new Set<() => void>();
const EMPTY_TOPICS: Topic[] = [];

/** Clears the in-memory catalog cache (tests only). */
export function resetTopicCatalogCacheForTests(): void {
  sharedCatalog = null;
  sharedCatalogPromise = null;
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
    catalogLoadStarted = false;
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

function getTopicsClientSnapshot(): Topic[] {
  return sharedCatalog ?? EMPTY_TOPICS;
}

function getTopicsServerSnapshot(): Topic[] {
  return EMPTY_TOPICS;
}

function getLoadingClientSnapshot(): boolean {
  return sharedCatalog === null && catalogLoadStarted;
}

function getLoadingServerSnapshot(): boolean {
  return false;
}

async function fetchSharedCatalog(signal?: AbortSignal): Promise<Topic[]> {
  const rows = await listTopics({ signal });
  sharedCatalog = rows as Topic[];
  return sharedCatalog;
}

async function loadSharedCatalog(signal?: AbortSignal): Promise<Topic[]> {
  if (sharedCatalog) return sharedCatalog;
  if (!sharedCatalogPromise) {
    sharedCatalogPromise = fetchSharedCatalog(signal).catch((err: unknown) => {
      sharedCatalogPromise = null;
      throw err;
    });
  }
  return sharedCatalogPromise;
}

function topicsByIdsFromCatalog(catalog: Topic[], ids: string[]): Topic[] {
  if (ids.length === 0) return [];
  const byId = new Map(catalog.map(t => [t.id, t]));
  const seen = new Set<string>();
  const out: Topic[] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);
    const topic = byId.get(id);
    if (topic) out.push(topic);
  }
  return out;
}

const getTopicsByIds = async (ids: string[]) => {
  const catalog = await loadSharedCatalog();
  return topicsByIdsFromCatalog(catalog, ids);
};

const getPrimaryTopicForPrediction = async (ids: string[]) => {
  const linked = await getTopicsByIds(ids);
  return pickPrimaryTopicFromLinked(linked);
};

const getParentBucketTopics = async (topic: Topic) => {
  if (topic.kind !== 'curated') return [];
  return (await getTopicsByIds(topic.parentTopicIds)).filter(t => t.kind === 'bucket');
};

/**
 * Client-side topic lookup for chips and labels.
 * Catalog is loaded once via the topics API; ID lookups use that in-memory cache.
 */
export function useTopicCatalog(): {
  topics: Topic[];
  loading: boolean;
  getTopicsByIds: (ids: string[]) => Promise<Topic[]>;
  getPrimaryTopicForPrediction: (ids: string[]) => Promise<Topic | null>;
  getParentBucketTopics: (topic: Topic) => Promise<Topic[]>;
} {
  const topics = useSyncExternalStore(
    subscribeToTopicCatalog,
    getTopicsClientSnapshot,
    getTopicsServerSnapshot,
  );
  const loading = useSyncExternalStore(
    subscribeToTopicCatalog,
    getLoadingClientSnapshot,
    getLoadingServerSnapshot,
  );

  return {
    topics,
    loading,
    getTopicsByIds,
    getPrimaryTopicForPrediction,
    getParentBucketTopics,
  };
}
