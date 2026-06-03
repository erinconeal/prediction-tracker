import type { LeaderboardPage } from '@/lib/leaderboard';
import { buildLeaderboardRow } from '@/test/factories/leaderboard-row';

export function buildLeaderboardPage(
  overrides: Partial<LeaderboardPage> = {},
): LeaderboardPage {
  const rows = overrides.rows ?? [buildLeaderboardRow()];
  return {
    rows,
    total: rows.length,
    rankedCount: rows.filter(r => r.scored > 0).length,
    offset: 0,
    limit: 8,
    hasMore: false,
    displayStats: {
      distinctSourcesWithScored: rows.filter(r => r.scored > 0).length,
      totalScored: rows.reduce((sum, r) => sum + r.scored, 0),
      topSourceScored: rows[0]?.scored ?? 0,
    },
    showFullRankings: false,
    ...overrides,
  };
}
