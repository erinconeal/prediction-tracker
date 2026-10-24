import { describe, expect, test } from 'vitest';

import { createMigratedTestDb } from '@/test/helpers/create-test-db';

import { topics } from './schema';

describe('createDb', () => {
  test('given in-memory db, when selecting topics, then returns empty list', async () => {
    const db = createMigratedTestDb();

    const rows = await db.select().from(topics);
    expect(rows).toEqual([]);
  });
});
