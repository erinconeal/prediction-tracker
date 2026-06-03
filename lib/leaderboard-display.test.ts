import { describe, expect, test } from 'vitest';
import { buildLeaderboardRow } from '@/test/factories/leaderboard-row';
import {
  boundaryCredibleLeaderboardRows,
  credibleLeaderboardRows,
} from '@/test/factories/credible-leaderboard-rows';
import {
  LEADERBOARD_MIN_SOURCES_WITH_SCORED,
  LEADERBOARD_MIN_TOP_SOURCE_SCORED,
  LEADERBOARD_MIN_TOTAL_SCORED,
  insufficientLeaderboardMessage,
  leaderboardDisplayStats,
  shouldShowFullLeaderboard,
  sourcesByScoredVolume,
} from './leaderboard-display';

describe('leaderboardDisplayStats', () => {
  test('given mixed scored and unscored, counts only sources with scored > 0', () => {
    const stats = leaderboardDisplayStats([
      ...credibleLeaderboardRows().slice(0, 3),
      buildLeaderboardRow({ source: 'D', scored: 0, stillOpen: 2 }),
    ]);
    expect(stats).toEqual({
      distinctSourcesWithScored: 3,
      totalScored: 12,
      topSourceScored: 5,
    });
  });
});

describe('shouldShowFullLeaderboard', () => {
  test('given empty rows, should be false', () => {
    expect(shouldShowFullLeaderboard([])).toBe(false);
  });

  test('given thin seed-like data, should be false', () => {
    expect(
      shouldShowFullLeaderboard([
        buildLeaderboardRow({
          rank: 1,
          scored: 2,
          correct: 2,
          accuracyPercent: 100,
        }),
        buildLeaderboardRow({
          rank: 2,
          source: 'B',
          scored: 1,
          correct: 0,
          accuracyPercent: 0,
        }),
      ]),
    ).toBe(false);
  });

  test('given credible volume, should be true', () => {
    expect(shouldShowFullLeaderboard(credibleLeaderboardRows())).toBe(true);
  });

  test('given boundary thresholds exactly met, should be true', () => {
    expect(shouldShowFullLeaderboard(boundaryCredibleLeaderboardRows())).toBe(
      true,
    );
  });

  test('given enough total scored but weak leader sample, should be false', () => {
    expect(
      shouldShowFullLeaderboard([
        buildLeaderboardRow({
          rank: 1,
          scored: 2,
          correct: 2,
          accuracyPercent: 100,
        }),
        buildLeaderboardRow({
          rank: 2,
          source: 'B',
          scored: 4,
          correct: 3,
        }),
        buildLeaderboardRow({
          rank: 3,
          source: 'C',
          scored: 4,
          correct: 3,
        }),
      ]),
    ).toBe(false);
  });

  test('given nine total scored at boundary, should be false', () => {
    expect(
      shouldShowFullLeaderboard([
        buildLeaderboardRow({
          rank: 1,
          scored: 3,
          correct: 2,
        }),
        buildLeaderboardRow({
          rank: 2,
          source: 'B',
          scored: 3,
          correct: 2,
        }),
        buildLeaderboardRow({
          rank: 3,
          source: 'C',
          scored: 3,
          correct: 2,
        }),
      ]),
    ).toBe(false);
  });
});

describe('sourcesByScoredVolume', () => {
  test('should sort by scored count not accuracy', () => {
    const preview = sourcesByScoredVolume([
      buildLeaderboardRow({
        source: 'HighAcc',
        scored: 1,
        correct: 1,
        accuracyPercent: 100,
      }),
      buildLeaderboardRow({
        source: 'MoreData',
        scored: 4,
        correct: 2,
        accuracyPercent: 50,
      }),
    ]);
    expect(preview.map(r => r.source)).toEqual(['MoreData', 'HighAcc']);
  });

  test('given equal scored counts, should break ties by accuracy', () => {
    const preview = sourcesByScoredVolume([
      buildLeaderboardRow({
        source: 'Lower',
        scored: 3,
        correct: 1,
        accuracyPercent: 33.3,
      }),
      buildLeaderboardRow({
        source: 'Higher',
        scored: 3,
        correct: 2,
        accuracyPercent: 66.7,
      }),
    ]);
    expect(preview.map(r => r.source)).toEqual(['Higher', 'Lower']);
  });
});

describe('insufficientLeaderboardMessage', () => {
  test('should mention configured thresholds and current progress', () => {
    const stats = leaderboardDisplayStats([
      buildLeaderboardRow({ scored: 2, correct: 2 }),
      buildLeaderboardRow({ source: 'B', scored: 1, correct: 0 }),
    ]);
    const msg = insufficientLeaderboardMessage(stats);
    expect(msg).toContain(String(LEADERBOARD_MIN_TOTAL_SCORED));
    expect(msg).toContain(String(LEADERBOARD_MIN_SOURCES_WITH_SCORED));
    expect(msg).toContain(String(LEADERBOARD_MIN_TOP_SOURCE_SCORED));
    expect(msg).toContain(`${stats.totalScored} so far`);
    expect(msg).toContain(`${stats.distinctSourcesWithScored} so far`);
    expect(msg).toContain(`${stats.topSourceScored} so far`);
  });
});
