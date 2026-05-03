import type { Prediction } from "@/types/prediction";

/** Newest first; same `created_at` breaks ties with `id` (stable, deterministic). */
export function comparePredictionsNewestFirst(
  a: Prediction,
  b: Prediction,
): number {
  const t =
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  if (t !== 0) return t;
  return b.id.localeCompare(a.id);
}
