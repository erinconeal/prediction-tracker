import { NextResponse } from 'next/server';
import { computeLeaderboardPage } from '@/lib/leaderboard';
import { filterAndSortPredictions } from '@/lib/prediction-store';

/**
 * Parses a bounded integer from a string, returning a fallback value if the string is null or not a valid integer.
 * @param raw - The string to parse.
 * @param fallback - The value to return if the string is null or not a valid integer.
 * @param min - The minimum value to return.
 * @param max - The maximum value to return.
 * @returns The parsed integer, or the fallback value if the string is null or not a valid integer.
 */
function parseBoundedInt(
  raw: string | null,
  fallback: number,
  min: number,
  max: number,
): number {
  if (raw === null) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

/**
 * Full-dataset leaderboard (not tied to paginated prediction list).
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseBoundedInt(searchParams.get('limit'), 8, 1, 50);
  const offset = parseBoundedInt(searchParams.get('offset'), 0, 0, 10_000);
  const all = filterAndSortPredictions({});
  const page = computeLeaderboardPage(all, { limit, offset });
  return NextResponse.json(page);
}
