import { NextResponse } from "next/server";
import { computeLeaderboard } from "@/lib/leaderboard";
import { filterAndSortPredictions } from "@/lib/prediction-store";

/**
 * Full-dataset leaderboard for the home aside (not tied to paginated list).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("limit");
  const limit = raw === null ? 8 : Math.min(50, Math.max(1, Number.parseInt(raw, 10) || 8));
  const all = filterAndSortPredictions({});
  const rows = computeLeaderboard(all, limit);
  return NextResponse.json(rows);
}
