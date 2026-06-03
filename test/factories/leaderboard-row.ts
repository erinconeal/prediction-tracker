import type { LeaderboardRow } from '@/lib/leaderboard';

export function buildLeaderboardRow(
  overrides: Partial<LeaderboardRow> = {},
): LeaderboardRow {
  return {
    rank: 1,
    source: 'Source',
    sourceSlug: 'source',
    total: 1,
    noLongerOpen: 0,
    scored: 0,
    correct: 0,
    accuracyPercent: null,
    stillOpen: 1,
    outcomeUnresolved: 0,
    invalid: 0,
    streakKind: null,
    streakLength: 0,
    ...overrides,
  };
}
