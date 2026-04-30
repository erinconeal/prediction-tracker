import type { Prediction } from "@/types/prediction";

export type SourceAccuracyStats = {
  name: string;
  total: number;
  resolved: number;
  /** One decimal percent; null when nothing resolved yet. */
  accuracy: number | null;
};

/**
 * Aggregates resolved/correct counts and accuracy for a list of predictions
 * sharing one source (e.g. filtered `usePredictions` result).
 */
export function computeSourceAccuracyStats(
  predictions: Prediction[],
  options: {
    /** Used when the list is empty or has no `source` on row 0 (e.g. URL slug). */
    nameFallback: string;
    /** When set, preferred display name even if `predictions` is temporarily empty. */
    primaryName?: string | null;
  },
): SourceAccuracyStats {
  const name =
    (options.primaryName != null && options.primaryName !== ""
      ? options.primaryName
      : undefined) ??
    predictions[0]?.source ??
    options.nameFallback;

  let resolved = 0;
  let correct = 0;
  for (const p of predictions) {
    if (p.outcome === "pending") continue;
    resolved += 1;
    if (p.outcome === "correct") correct += 1;
  }
  const accuracy =
    resolved === 0 ? null : Math.round((correct / resolved) * 1000) / 10;

  return {
    name,
    total: predictions.length,
    resolved,
    accuracy,
  };
}
