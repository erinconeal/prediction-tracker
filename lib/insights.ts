import { computeLeaderboard, type LeaderboardRow } from "@/lib/leaderboard";
import type { Prediction } from "@/types/prediction";

/**
 * Discriminated union of insight cards the dashboard can surface.
 * Each variant carries the structured data that produced its `headline`,
 * which lets tests and downstream consumers introspect without re-parsing.
 */
export type Insight =
  | {
      kind: "top_accuracy";
      headline: string;
      source: string;
      correct: number;
      /** Correct + incorrect (constitution §7.2 denominator). */
      scored: number;
    }
  | {
      kind: "hot_streak";
      headline: string;
      source: string;
      length: number;
    }
  | {
      kind: "cold_streak";
      headline: string;
      source: string;
      length: number;
    }
  | {
      kind: "category_gap";
      headline: string;
      topCategory: string;
      bottomCategory: string;
      topPercent: number;
      bottomPercent: number;
    }
  | {
      kind: "unresolved_majority";
      headline: string;
      pendingPercent: number;
    };

const TOP_ACCURACY_MIN_RESOLVED = 2;
const HOT_STREAK_MIN_LENGTH = 3;
const COLD_STREAK_MIN_LENGTH = 2;
const CATEGORY_MIN_RESOLVED = 3;
const CATEGORY_MIN_GAP_POINTS = 25;
const UNRESOLVED_MIN_TOTAL = 5;
const UNRESOLVED_MIN_RATIO = 0.6;

/** Longest streak wins; ties break to better leaderboard rank (lower `rank`). */
function pickBestStreakRow(candidates: LeaderboardRow[]): LeaderboardRow {
  return candidates.reduce((best, r) => {
    if (r.streakLength > best.streakLength) return r;
    if (r.streakLength < best.streakLength) return best;
    return r.rank < best.rank ? r : best;
  });
}

function topAccuracyInsight(rows: LeaderboardRow[]): Insight | null {
  const top = rows.find(
    (r) =>
      r.accuracyPercent === 100 && r.scored >= TOP_ACCURACY_MIN_RESOLVED,
  );
  if (!top) return null;
  return {
    kind: "top_accuracy",
    headline: `${top.source} has been correct on ${top.correct}/${top.scored} scored predictions.`,
    source: top.source,
    correct: top.correct,
    scored: top.scored,
  };
}

function hotStreakInsight(rows: LeaderboardRow[]): Insight | null {
  const candidates = rows.filter(
    (r) =>
      r.streakKind === "correct" && r.streakLength >= HOT_STREAK_MIN_LENGTH,
  );
  if (candidates.length === 0) return null;
  const top = pickBestStreakRow(candidates);
  return {
    kind: "hot_streak",
    headline: `${top.source} is on a ${top.streakLength}-prediction correct streak.`,
    source: top.source,
    length: top.streakLength,
  };
}

function coldStreakInsight(rows: LeaderboardRow[]): Insight | null {
  const candidates = rows.filter(
    (r) =>
      r.streakKind === "incorrect" && r.streakLength >= COLD_STREAK_MIN_LENGTH,
  );
  if (candidates.length === 0) return null;
  const top = pickBestStreakRow(candidates);
  return {
    kind: "cold_streak",
    headline: `${top.source} has been incorrect on their last ${top.streakLength} predictions.`,
    source: top.source,
    length: top.streakLength,
  };
}

type CategoryAgg = {
  category: string;
  scored: number;
  correct: number;
  percent: number;
};

function categoryGapInsight(predictions: Prediction[]): Insight | null {
  const bySlot = new Map<string, { scored: number; correct: number }>();
  for (const p of predictions) {
    if (p.category === null) continue;
    if (p.outcome !== "correct" && p.outcome !== "incorrect") continue;
    const cur = bySlot.get(p.category) ?? { scored: 0, correct: 0 };
    cur.scored += 1;
    if (p.outcome === "correct") cur.correct += 1;
    bySlot.set(p.category, cur);
  }
  const eligible: CategoryAgg[] = [];
  for (const [category, agg] of bySlot) {
    if (agg.scored < CATEGORY_MIN_RESOLVED) continue;
    eligible.push({
      category,
      scored: agg.scored,
      correct: agg.correct,
      percent: Math.round((agg.correct / agg.scored) * 100),
    });
  }
  if (eligible.length < 2) return null;
  eligible.sort((a, b) => b.percent - a.percent);
  const top = eligible[0]!;
  const bottom = eligible[eligible.length - 1]!;
  if (top.percent - bottom.percent < CATEGORY_MIN_GAP_POINTS) return null;
  return {
    kind: "category_gap",
    headline: `Predictions in ${top.category} are more accurate than ${bottom.category} (${top.percent}% vs ${bottom.percent}%).`,
    topCategory: top.category,
    bottomCategory: bottom.category,
    topPercent: top.percent,
    bottomPercent: bottom.percent,
  };
}

function unresolvedMajorityInsight(
  predictions: Prediction[],
): Insight | null {
  if (predictions.length < UNRESOLVED_MIN_TOTAL) return null;
  const pending = predictions.filter((p) => p.outcome === "pending").length;
  const ratio = pending / predictions.length;
  if (ratio < UNRESOLVED_MIN_RATIO) return null;
  const percent = Math.round(ratio * 100);
  return {
    kind: "unresolved_majority",
    headline: `Most predictions (${percent}%) are still pending resolution.`,
    pendingPercent: percent,
  };
}

/**
 * Picks the single most interesting insight for the dashboard, or `null` when
 * no rule clears its threshold. Rules are evaluated in priority order:
 *
 * 1. `top_accuracy` — perfect-record source with enough sample size
 * 2. `hot_streak`   — sustained correct run
 * 3. `cold_streak`  — sustained incorrect run
 * 4. `category_gap` — a meaningful accuracy spread across categories
 * 5. `unresolved_majority` — the bulk of the dataset is still `pending`
 */
export function computeTopInsight(
  predictions: Prediction[],
): Insight | null {
  if (predictions.length === 0) return null;
  const leaderboard = computeLeaderboard(predictions, predictions.length);
  return (
    topAccuracyInsight(leaderboard) ??
    hotStreakInsight(leaderboard) ??
    coldStreakInsight(leaderboard) ??
    categoryGapInsight(predictions) ??
    unresolvedMajorityInsight(predictions)
  );
}
