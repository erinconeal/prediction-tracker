import { comparePredictionsNewestFirst } from "@/lib/prediction-sort";
import type { Prediction } from "@/types/prediction";

export type LeaderboardRow = {
  rank: number;
  source: string;
  total: number;
  resolved: number;
  correct: number;
  /** One decimal; null when nothing resolved yet for that source. */
  accuracyPercent: number | null;
  /**
   * Longest run of matching outcomes from the newest resolved prediction
   * (same ordering as the main feed: `created_at` desc, then global rank when
   * timestamps tie). Null when nothing is resolved for the source.
   */
  streakKind: "correct" | "incorrect" | null;
  streakLength: number;
};

function aggregateBySource(predictions: Prediction[]) {
  const bySource = new Map<
    string,
    { total: number; resolved: number; correct: number }
  >();
  for (const p of predictions) {
    const cur = bySource.get(p.source) ?? {
      total: 0,
      resolved: 0,
      correct: 0,
    };
    cur.total += 1;
    if (p.outcome !== "pending") {
      cur.resolved += 1;
      if (p.outcome === "correct") cur.correct += 1;
    }
    bySource.set(p.source, cur);
  }
  return bySource;
}

function groupPredictionsBySource(predictions: Prediction[]) {
  const m = new Map<string, Prediction[]>();
  for (const p of predictions) {
    const list = m.get(p.source) ?? [];
    list.push(p);
    m.set(p.source, list);
  }
  return m;
}

/** Current streak from the most recent resolved prediction backward. */
function resolvedOutcomeStreak(
  sourcePredictions: Prediction[],
  globalRankById: Map<string, number>,
): { kind: "correct" | "incorrect"; length: number } | null {
  const resolved = sourcePredictions
    .filter((p) => p.outcome !== "pending")
    .sort((a, b) => {
      const t =
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (t !== 0) return t;
      return (globalRankById.get(a.id) ?? 0) - (globalRankById.get(b.id) ?? 0);
    });
  if (resolved.length === 0) return null;
  const head = resolved[0]!;
  const kind = head.outcome as "correct" | "incorrect";
  let length = 0;
  for (const p of resolved) {
    if (p.outcome !== kind) break;
    length += 1;
  }
  return { kind, length };
}

/**
 * Ranks sources for a “top performers” rail: higher accuracy first, then more
 * predictions. Sources with no resolved rows sort last.
 */
export function computeLeaderboard(
  predictions: Prediction[],
  limit = 8,
): LeaderboardRow[] {
  const sortedGlobal = [...predictions].sort(comparePredictionsNewestFirst);
  const globalRankById = new Map(
    sortedGlobal.map((p, index) => [p.id, index]),
  );

  const bySource = aggregateBySource(predictions);
  const bySourcePredictions = groupPredictionsBySource(predictions);
  const rows = [...bySource.entries()].map(([source, s]) => ({
    source,
    total: s.total,
    resolved: s.resolved,
    correct: s.correct,
    accuracyPercent:
      s.resolved === 0
        ? null
        : (Math.round((s.correct / s.resolved) * 1000) / 10) as number,
  }));

  rows.sort((a, b) => {
    const ar = a.accuracyPercent ?? -1;
    const br = b.accuracyPercent ?? -1;
    if (br !== ar) return br - ar;
    return b.total - a.total;
  });

  return rows.slice(0, limit).map((r, i) => {
    const streak = resolvedOutcomeStreak(
      bySourcePredictions.get(r.source) ?? [],
      globalRankById,
    );
    return {
      rank: i + 1,
      source: r.source,
      total: r.total,
      resolved: r.resolved,
      correct: r.correct,
      accuracyPercent: r.accuracyPercent,
      streakKind: streak?.kind ?? null,
      streakLength: streak?.length ?? 0,
    };
  });
}
