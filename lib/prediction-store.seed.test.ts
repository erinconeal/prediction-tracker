import { beforeEach, describe, expect, test, vi } from 'vitest';
import { computeLeaderboardPage } from '@/lib/leaderboard';
import {
  LEADERBOARD_MIN_TOP_SOURCE_SCORED,
  LEADERBOARD_RUNNER_UP_CARD_MIN_ROWS,
  shouldShowFullLeaderboard,
} from '@/lib/leaderboard-display';

describe('prediction store seed', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  test('given fresh seed, should meet full leaderboard demo thresholds', async () => {
    const { filterAndSortPredictions } = await import('@/lib/prediction-store');
    const all = filterAndSortPredictions();
    const page = computeLeaderboardPage(all, { limit: 10 });

    expect(shouldShowFullLeaderboard(page.rows)).toBe(true);
    expect(page.rows.length).toBeGreaterThanOrEqual(
      LEADERBOARD_RUNNER_UP_CARD_MIN_ROWS,
    );
    expect(page.rows[0]!.scored).toBeGreaterThanOrEqual(
      LEADERBOARD_MIN_TOP_SOURCE_SCORED,
    );
    expect(page.rows[0]!.source).toBe('Jane Analyst');
    expect(page.rows[0]!.streakKind).toBe('correct');
    expect(page.rows[0]!.streakLength).toBeGreaterThanOrEqual(3);
  });
});
