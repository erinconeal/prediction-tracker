import path from 'node:path';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import type { AppDb } from '@/lib/db';
import { getDb } from '@/lib/db';
import { resetDbSingletonForTests } from '@/lib/db.test-utils';
import { clearPredictions } from '@/lib/db-clear-predictions';
import { runSeed } from '@/lib/db-seed';
import {
  predictionTopics,
  predictions,
  sources,
  topics,
} from '@/lib/schema';
import { createMigratedTestDb } from '@/test/helpers/create-test-db';
import {
  insertBucketTopic,
  insertPrediction,
  insertSource,
} from '@/test/helpers/db-fixtures';

const migrationsFolder = path.resolve(import.meta.dirname, '../drizzle');

async function topicSlugs(db: AppDb) {
  return (await db.select({ slug: topics.slug }).from(topics))
    .map(row => row.slug)
    .sort();
}

describe('clearPredictions', () => {
  test('given topics, sources, and predictions, when cleared, then topics remain and prediction and source counts are 0', async () => {
    const db = createMigratedTestDb();
    await insertBucketTopic(db, { id: 'topic-tech', slug: 'tech', name: 'Tech' });
    await insertBucketTopic(db, { id: 'topic-sports', slug: 'sports', name: 'Sports' });
    await insertSource(db, {
      id: 'source-jane',
      slug: 'jane-analyst',
      displayName: 'Jane Analyst',
    });
    await insertPrediction(db, {
      id: 'pred-1',
      sourceId: 'source-jane',
      text: 'Inflation will stay above 2%.',
      topicId: 'topic-tech',
    });

    const slugsBefore = await topicSlugs(db);

    await clearPredictions(db);

    expect(await topicSlugs(db)).toEqual(slugsBefore);
    expect(await db.select().from(predictions)).toEqual([]);
    expect(await db.select().from(sources)).toEqual([]);
    expect(await db.select().from(predictionTopics)).toEqual([]);
  });

  test('given only topics, when cleared, then topics remain and counts stay 0', async () => {
    const db = createMigratedTestDb();
    await insertBucketTopic(db, { id: 'topic-tech', slug: 'tech', name: 'Tech' });

    await clearPredictions(db);

    expect(await topicSlugs(db)).toEqual(['tech']);
    expect(await db.select().from(predictions)).toEqual([]);
    expect(await db.select().from(sources)).toEqual([]);
  });

  describe('after demo seed', () => {
    beforeEach(() => {
      resetDbSingletonForTests();
      vi.stubEnv('DATABASE_URL', ':memory:');
    });

    afterEach(() => {
      resetDbSingletonForTests();
      vi.unstubAllEnvs();
    });

    test('given Jane seed, when cleared, then Jane is not re-seeded and topics remain', async () => {
      migrate(getDb(), { migrationsFolder });
      await runSeed();
      const db = getDb();
      const slugsBefore = await topicSlugs(db);
      expect(slugsBefore.length).toBeGreaterThan(0);
      expect(await db.select().from(predictions)).not.toEqual([]);
      expect(await db.select().from(sources)).not.toEqual([]);

      await clearPredictions(db);

      expect(await topicSlugs(db)).toEqual(slugsBefore);
      expect(await db.select().from(predictions)).toEqual([]);
      expect(await db.select().from(sources)).toEqual([]);
    });
  });
});
