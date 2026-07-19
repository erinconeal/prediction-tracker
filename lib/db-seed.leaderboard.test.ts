import path from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { computeLeaderboardPage } from '@/lib/leaderboard';
import {
  LEADERBOARD_MIN_TOP_SOURCE_SCORED,
  LEADERBOARD_RUNNER_UP_CARD_MIN_ROWS,
  shouldShowFullLeaderboard,
} from '@/lib/leaderboard-display';
import { getDb } from '@/lib/db';
import { resetDbSingletonForTests } from '@/lib/db.test-utils';
import { runSeed } from '@/lib/db-seed';
import { filterAndSortPredictions } from '@/lib/prediction-query';
import { loadAllPredictions } from '@/lib/repositories/prediction-repository';

const migrationsFolder = path.resolve(import.meta.dirname, '../drizzle');

describe('db seed leaderboard demo', () => {
  beforeEach(() => {
    resetDbSingletonForTests();
    vi.stubEnv('DATABASE_URL', ':memory:');
  });

  afterEach(() => {
    resetDbSingletonForTests();
    vi.unstubAllEnvs();
  });

  test('given fresh seed, should meet full leaderboard demo thresholds', async () => {
    migrate(getDb(), { migrationsFolder });
    await runSeed();

    const all = await filterAndSortPredictions(await loadAllPredictions());
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
