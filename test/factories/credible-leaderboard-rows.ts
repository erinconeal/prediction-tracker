import { buildLeaderboardRow } from '@/test/factories/leaderboard-row';
import type { LeaderboardRow } from '@/lib/leaderboard';

/** Six-row credible set for full split leaderboard layout tests. */
export function credibleLeaderboardRows(): LeaderboardRow[] {
  return [
    buildLeaderboardRow({
      rank: 1,
      source: 'Leader One',
      sourceSlug: 'leader-one',
      scored: 5,
      correct: 4,
      accuracyPercent: 80,
      total: 6,
      streakKind: 'correct',
      streakLength: 3,
    }),
    buildLeaderboardRow({
      rank: 2,
      source: 'Runner Two',
      sourceSlug: 'runner-two',
      scored: 4,
      correct: 3,
      accuracyPercent: 75,
      total: 5,
    }),
    buildLeaderboardRow({
      rank: 3,
      source: 'Runner Three',
      sourceSlug: 'runner-three',
      scored: 3,
      correct: 2,
      accuracyPercent: 66.7,
      total: 4,
    }),
    buildLeaderboardRow({
      rank: 4,
      source: 'Four',
      sourceSlug: 'four',
      scored: 3,
      correct: 2,
      accuracyPercent: 66.7,
      total: 4,
    }),
    buildLeaderboardRow({
      rank: 5,
      source: 'Five',
      sourceSlug: 'five',
      scored: 3,
      correct: 1,
      accuracyPercent: 33.3,
      total: 4,
    }),
    buildLeaderboardRow({
      rank: 6,
      source: 'Six',
      sourceSlug: 'six',
      scored: 2,
      correct: 1,
      accuracyPercent: 50,
      total: 3,
    }),
  ];
}

/** Three sources, 12 total scored, leader scored 5 — meets all gating thresholds. */
export function boundaryCredibleLeaderboardRows(): LeaderboardRow[] {
  return [
    buildLeaderboardRow({
      rank: 1,
      source: 'Leader',
      sourceSlug: 'leader',
      scored: 5,
      correct: 4,
      accuracyPercent: 80,
      total: 8,
    }),
    buildLeaderboardRow({
      rank: 2,
      source: 'B',
      sourceSlug: 'b',
      scored: 4,
      correct: 3,
      accuracyPercent: 75,
      total: 5,
    }),
    buildLeaderboardRow({
      rank: 3,
      source: 'C',
      sourceSlug: 'c',
      scored: 3,
      correct: 2,
      accuracyPercent: 66.7,
      total: 4,
    }),
  ];
}

export function thinLeaderboardRows(): LeaderboardRow[] {
  return [
    buildLeaderboardRow({
      rank: 1,
      source: 'Jane Analyst',
      sourceSlug: 'jane-analyst',
      total: 4,
      scored: 2,
      correct: 2,
      accuracyPercent: 100,
      stillOpen: 1,
    }),
    buildLeaderboardRow({
      rank: 2,
      source: 'Tech Blogger',
      sourceSlug: 'tech-blogger',
      scored: 1,
      correct: 0,
      accuracyPercent: 0,
      total: 2,
    }),
    buildLeaderboardRow({
      rank: 3,
      source: 'Pending Only',
      sourceSlug: 'still-open-only',
      scored: 0,
      stillOpen: 3,
      accuracyPercent: null,
      total: 3,
    }),
  ];
}
