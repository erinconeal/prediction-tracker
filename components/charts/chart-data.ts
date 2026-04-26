import type { Prediction } from "@/types/prediction";

export type AccuracyPoint = { month: string; accuracy: number | null };

export type SourceCount = { source: string; count: number };

export type OutcomeSlice = { name: string; value: number; fill: string };

function monthKey(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  // Use UTC to keep bucket keys stable across environments/time zones.
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Resolved predictions bucketed by creation month; accuracy = correct / resolved. */
export function buildAccuracyOverTime(predictions: Prediction[]): AccuracyPoint[] {
  const buckets = new Map<
    string,
    { correct: number; incorrect: number }
  >();
  for (const p of predictions) {
    const key = monthKey(p.created_at);
    if (!key) continue;
    if (p.outcome === "pending") continue;
    const b = buckets.get(key) ?? { correct: 0, incorrect: 0 };
    if (p.outcome === "correct") b.correct += 1;
    else b.incorrect += 1;
    buckets.set(key, b);
  }
  const keys = [...buckets.keys()].sort();
  return keys.map((k) => {
    const b = buckets.get(k)!;
    const resolved = b.correct + b.incorrect;
    return {
      month: k,
      accuracy: resolved === 0 ? null : (b.correct / resolved) * 100,
    };
  });
}

export function buildPerSourceCounts(predictions: Prediction[]): SourceCount[] {
  const map = new Map<string, number>();
  for (const p of predictions) {
    map.set(p.source, (map.get(p.source) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);
}

export function buildOutcomeSplit(predictions: Prediction[]): OutcomeSlice[] {
  let c = 0,
    i = 0,
    p = 0;
  for (const pred of predictions) {
    if (pred.outcome === "correct") c += 1;
    else if (pred.outcome === "incorrect") i += 1;
    else p += 1;
  }
  return [
    { name: "Correct", value: c, fill: "#059669" },
    { name: "Incorrect", value: i, fill: "#dc2626" },
    { name: "Pending", value: p, fill: "#d97706" },
  ].filter((s) => s.value > 0);
}
