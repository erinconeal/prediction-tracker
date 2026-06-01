import type { LeaderboardRow } from '@/lib/leaderboard';

/** Minimum sources with at least one scored prediction to show full rankings. */
export const LEADERBOARD_MIN_SOURCES_WITH_SCORED = 3;

/** Minimum scored outcomes platform-wide before full rankings. */
export const LEADERBOARD_MIN_TOTAL_SCORED = 10;

/** Minimum scored predictions for the #1 source (avoids misleading 100% from n=1–2). */
export const LEADERBOARD_MIN_TOP_SOURCE_SCORED = 3;

/** Show separate runner-up cards only when there are enough ranks. */
export const LEADERBOARD_RUNNER_UP_CARD_MIN_ROWS = 6;

export type LeaderboardDisplayStats = {
  distinctSourcesWithScored: number;
  totalScored: number;
  topSourceScored: number;
};

export function leaderboardDisplayStats(
  rows: LeaderboardRow[],
): LeaderboardDisplayStats {
  const withScored = rows.filter(r => r.scored > 0);
  return {
    distinctSourcesWithScored: withScored.length,
    totalScored: rows.reduce((sum, r) => sum + r.scored, 0),
    topSourceScored: rows[0]?.scored ?? 0,
  };
}

export function shouldShowFullLeaderboard(rows: LeaderboardRow[]): boolean {
  if (rows.length === 0) return false;
  const stats = leaderboardDisplayStats(rows);
  return (
    stats.distinctSourcesWithScored >= LEADERBOARD_MIN_SOURCES_WITH_SCORED
    && stats.totalScored >= LEADERBOARD_MIN_TOTAL_SCORED
    && stats.topSourceScored >= LEADERBOARD_MIN_TOP_SOURCE_SCORED
  );
}

/** Top sources by scored volume (honest preview when rankings are gated). */
export function sourcesByScoredVolume(
  rows: LeaderboardRow[],
  limit = 3,
): LeaderboardRow[] {
  return [...rows]
    .filter(r => r.scored > 0)
    .sort((a, b) => {
      if (b.scored !== a.scored) return b.scored - a.scored;
      const ar = a.accuracyPercent ?? -1;
      const br = b.accuracyPercent ?? -1;
      return br - ar;
    })
    .slice(0, limit);
}

export function insufficientLeaderboardMessage(
  stats: LeaderboardDisplayStats,
): string {
  return [
    'Rankings appear once we have at least',
    `${LEADERBOARD_MIN_TOTAL_SCORED} scored outcomes (${stats.totalScored} so far),`,
    `${LEADERBOARD_MIN_SOURCES_WITH_SCORED} sources with scored predictions (${stats.distinctSourcesWithScored} so far),`,
    `and the leader having ${LEADERBOARD_MIN_TOP_SOURCE_SCORED}+ scored (${stats.topSourceScored} so far).`,
  ].join(' ');
}

/** Section-level constitution §7.3 time-range disclosure for leaderboard accuracy. */
export const LEADERBOARD_ACCURACY_TIME_RANGE_LABEL
  = 'All predictions on record (no date filter).';
