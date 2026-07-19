import { describe, expect, test } from 'vitest';
import { topics } from './schema';
import { createMigratedTestDb } from '@/test/helpers/create-test-db';

describe('createDb', () => {
  test('given in-memory db, when selecting topics, then returns empty list', async () => {
    const db = createMigratedTestDb();

    const rows = await db.select().from(topics);
    expect(rows).toEqual([]);
  });
});
