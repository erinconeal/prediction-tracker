import type { PredictionFilters } from "@/types/prediction";

/** Stable cache key for filter objects (sorted keys, consistent shape). */
export function getFilterKey(filters: PredictionFilters): string {
  const normalized: Record<string, string | undefined> = {
    source: filters.source?.trim() || undefined,
    status: filters.status === "all" || filters.status === undefined ? undefined : filters.status,
  };
  return JSON.stringify(
    Object.keys(normalized)
      .sort()
      .reduce<Record<string, string | undefined>>((acc, key) => {
        const k = key as keyof typeof normalized;
        if (normalized[k] !== undefined) acc[k] = normalized[k];
        return acc;
      }, {}),
  );
}
