import { describe, expect, test } from 'vitest';
import { createMigratedTestDb, expectForeignKeysEnabled, listUserTables } from '@/test/helpers/create-test-db';
import { insertSource } from '@/test/helpers/db-fixtures';
import { predictions, topics } from '@/lib/schema';

describe('database migrations', () => {
  test('given fresh in-memory db, when migrations run, then core tables exist', () => {
    const db = createMigratedTestDb();
    expectForeignKeysEnabled(db);
    expect(listUserTables(db)).toEqual([
      'prediction_topics',
      'predictions',
      'sources',
      'topic_parents',
      'topics',
      '__drizzle_migrations',
    ].sort());
  });

  test('given migrated db, when selecting topics, then returns empty list', async () => {
    const db = createMigratedTestDb();
    const rows = await db.select().from(topics);
    expect(rows).toEqual([]);
  });

  test('given migrated db, when selecting predictions, then resolutionUrl column allows null', async () => {
    const db = createMigratedTestDb();
    await insertSource(db, {
      id: 'source-jane',
      slug: 'jane-analyst',
      displayName: 'Jane Analyst',
    });
    await db.insert(predictions).values({
      id: 'pred-1',
      sourceId: 'source-jane',
      text: 'test prediction',
      createdAt: '2026-01-01T00:00:00.000Z',
      outcome: 'still_open',
    });

    const rows = await db.select({ resolutionUrl: predictions.resolutionUrl }).from(predictions);
    expect(rows).toEqual([{ resolutionUrl: null }]);
  });
});
