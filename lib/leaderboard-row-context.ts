import { formatStillOpenCount } from '@/lib/lifecycle-copy';
import type { LeaderboardRow } from '@/lib/leaderboard';

/** Shared §7.3 rollup fields for leaderboard rows and source stats. */
export type AccuracyContextCounts = Pick<
  LeaderboardRow,
  'scored' | 'stillOpen' | 'outcomeUnresolved' | 'invalid'
>;

/**
 * Constitution §7.3 context alongside accuracy on leaderboard rows.
 */
export function formatLeaderboardAccuracyContext(row: AccuracyContextCounts): string {
  const segments = [
    `${row.scored} scored (correct + incorrect)`,
    row.stillOpen > 0 ? formatStillOpenCount(row.stillOpen) : null,
    row.outcomeUnresolved > 0 ? `${row.outcomeUnresolved} unresolved` : null,
    row.invalid > 0 ? `${row.invalid} invalid` : null,
  ].filter((segment): segment is string => segment !== null);

  return segments.join(' · ');
}
