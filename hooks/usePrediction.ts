"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, getPrediction } from "@/services/api";
import type { Prediction } from "@/types/prediction";
import { isAbortError } from "@/utils/is-abort-error";

export type UsePredictionResult = {
  prediction: Prediction | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function usePrediction(id: string): UsePredictionResult {
  const genRef = useRef(0);
  const refetchAbortRef = useRef<AbortController | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const gen = ++genRef.current;
    const controller = new AbortController();

    async function load(): Promise<void> {
      setLoading(true);
      setError(null);
      try {
        const row = await getPrediction(id, controller.signal);
        if (genRef.current !== gen) return;
        setPrediction(row);
      } catch (e: unknown) {
        if (isAbortError(e)) return;
        if (genRef.current !== gen) return;
        if (e instanceof ApiError && e.status === 404) {
          setPrediction(null);
          setError("Prediction not found.");
        } else {
          setError(e instanceof ApiError ? e.message : "Something went wrong");
          setPrediction(null);
        }
      } finally {
        if (genRef.current === gen) setLoading(false);
      }
    }

    void load();

    return () => {
      controller.abort();
      refetchAbortRef.current?.abort();
      refetchAbortRef.current = null;
    };
  }, [id]);

  const refetch = useCallback(async (): Promise<void> => {
    const gen = ++genRef.current;
    refetchAbortRef.current?.abort();
    const controller = new AbortController();
    refetchAbortRef.current = controller;

    setLoading(true);
    setError(null);
    try {
      const row = await getPrediction(id, controller.signal);
      if (genRef.current !== gen) return;
      setPrediction(row);
    } catch (e: unknown) {
      if (isAbortError(e)) return;
      if (genRef.current !== gen) return;
      if (e instanceof ApiError && e.status === 404) {
        setPrediction(null);
        setError("Prediction not found.");
      } else {
        setError(e instanceof ApiError ? e.message : "Something went wrong");
      }
    } finally {
      if (genRef.current === gen) setLoading(false);
      if (refetchAbortRef.current === controller) {
        refetchAbortRef.current = null;
      }
    }
  }, [id]);

  return { prediction, loading, error, refetch };
}
