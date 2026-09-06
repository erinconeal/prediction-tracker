'use client';

import { useCallback, useState, useRef, useEffect } from 'react';
import { ApiError, createPrediction } from '@/services/api';
import type { CreatePredictionInput, Prediction } from '@/types/prediction';
import { isAbortError } from '@/utils/is-abort-error';

export type UseCreatePredictionResult = {
  create: (
    input: CreatePredictionInput,
    options: { staffSecret: string },
  ) => Promise<Prediction | null>;
  loading: boolean;
  error: string | null;
  prediction: Prediction | null;
};

/**
 * Creates a prediction through the API service. Aborts an in-flight create on
 * unmount or a newer create(); only the latest request may update loading,
 * error, and prediction. `create` resolves null for both abort and failure —
 * read `error` to tell them apart.
 */
export function useCreatePrediction(): UseCreatePredictionResult {
  const abortRef = useRef<AbortController | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, []);

  const create = useCallback(
    async (
      input: CreatePredictionInput,
      { staffSecret }: { staffSecret: string },
    ): Promise<Prediction | null> => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);
      setPrediction(null);

      try {
        const created = await createPrediction(input, {
          signal: controller.signal,
          staffSecret,
        });
        if (abortRef.current !== controller) return null;
        setPrediction(created);
        return created;
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

  return { create, loading, error, prediction };
}
