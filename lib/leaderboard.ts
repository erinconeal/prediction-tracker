import type { Prediction } from "@/types/prediction";

export type LeaderboardRow = {
  rank: number;
  source: string;
  total: number;
  resolved: number;
  correct: number;
  /** One decimal; null when nothing resolved yet for that source. */
  accuracyPercent: number | null;
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

/**
 * Ranks sources for a “top performers” rail: higher accuracy first, then more
 * predictions. Sources with no resolved rows sort last.
 */
export function computeLeaderboard(
  predictions: Prediction[],
  limit = 8,
): LeaderboardRow[] {
  const bySource = aggregateBySource(predictions);
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

  return rows.slice(0, limit).map((r, i) => ({
    rank: i + 1,
    source: r.source,
    total: r.total,
    resolved: r.resolved,
    correct: r.correct,
    accuracyPercent: r.accuracyPercent,
  }));
}
