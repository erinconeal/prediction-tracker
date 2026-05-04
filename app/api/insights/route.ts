import { NextResponse } from "next/server";
import { computeTopInsight } from "@/lib/insights";
import { filterAndSortPredictions } from "@/lib/prediction-store";

/**
 * Single most-interesting insight derived from the full dataset, or `null` when
 * no rule clears its threshold. Mirrors `/api/leaderboard` so the dashboard can
 * keep components free of business logic.
 */
export async function GET() {
  const all = filterAndSortPredictions({});
  const insight = computeTopInsight(all);
  return NextResponse.json(insight);
}
