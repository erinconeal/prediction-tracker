'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { ApiError, updatePredictionOutcome } from '@/services/api';
import type { Prediction, TerminalOutcome } from '@/types/prediction';
import { isAbortError } from '@/utils/is-abort-error';

export type UseUpdatePredictionResult = {
  loading: boolean;
  error: string | null;
  updatedRow: Prediction | null;
  update: (predictionId: string, outcome: TerminalOutcome, { staffSecret, resolutionUrl }: { staffSecret: string; resolutionUrl?: string | null }) => Promise<Prediction | null>;
};

/**
 * Updates a prediction through the API service. Aborts an in-flight update on
 * unmount or a newer update(); only the latest request may update loading,
 * error, and updatedRow. `update` resolves null for both abort and failure —
 * read `error` to tell them apart.
 */
export function useUpdatePrediction(): UseUpdatePredictionResult {
  const abortRef = useRef<AbortController | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedRow, setUpdatedRow] = useState<Prediction | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, []);

  const update = useCallback(
    async (
      predictionId: string,
      outcome: TerminalOutcome,
      { staffSecret, resolutionUrl = null }: { staffSecret: string; resolutionUrl?: string | null },
    ): Promise<Prediction | null> => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);
      setUpdatedRow(null);

      try {
        const updated = await updatePredictionOutcome(predictionId, outcome, { signal: controller.signal, staffSecret, resolutionUrl });
        if (abortRef.current !== controller) return null;
        setUpdatedRow(updated);
        return updated;
      }
      catch (error: unknown) {
        if (isAbortError(error)) return null;
        if (abortRef.current !== controller) return null;
        setError(error instanceof ApiError ? error.message : 'Something went wrong');
        return null;
      }
      finally {
        if (abortRef.current === controller) {
          setLoading(false);
          abortRef.current = null;
        }
      }
    },
    [],
  );

  return { loading, error, updatedRow, update };
}
