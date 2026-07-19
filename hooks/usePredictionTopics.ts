'use client';

import { useMemo } from 'react';
import { useTopicCatalog } from '@/hooks/useTopicCatalog';
import {
  resolvePredictionTopics,
  type ResolvedPredictionTopics,
} from '@/lib/resolve-prediction-topics';

export type PredictionTopicsState = ResolvedPredictionTopics & {
  /** False while catalog is still loading for non-empty topic ids. */
  ready: boolean;
};

const EMPTY: PredictionTopicsState = {
  topics: [],
  primary: null,
  bucketParent: null,
  extraTopics: [],
  ready: true,
};

export function usePredictionTopics(topicIds: string[]): PredictionTopicsState {
  const { topics: catalog, loading } = useTopicCatalog();
  const idsKey = topicIds.join('\0');

  return useMemo(() => {
    const ids = idsKey === '' ? [] : idsKey.split('\0');
    const pending = ids.length > 0 && loading && catalog.length === 0;
    if (pending) {
      return { ...EMPTY, ready: false };
    }
    return { ...resolvePredictionTopics(ids, catalog), ready: true };
  }, [idsKey, catalog, loading]);
}
