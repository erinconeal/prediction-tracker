import { describe, expect, test } from 'vitest';
import { createMigratedTestDb, expectForeignKeysEnabled, listUserTables } from '@/test/helpers/create-test-db';
import { topics } from '@/lib/schema';

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
});
