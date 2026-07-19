import path from 'node:path';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { createDb, type AppDb } from '@/lib/db';

const migrationsFolder = path.resolve(import.meta.dirname, '../../drizzle');

export function createMigratedTestDb(url = ':memory:'): AppDb {
  const db = createDb(url);
  migrate(db, { migrationsFolder });
  return db;
}

/** Assert SQLite FK enforcement is on (createDb should enable this) */
export function expectForeignKeysEnabled(db: AppDb): void {
  const enabled = db.$client.pragma('foreign_keys', { simple: true });
  if (enabled !== 1) {
    throw new Error(`expected foreign_keys=1, but got ${enabled}`);
  }
};

/** List user tables after migration (ignores drizzle migration table) */
export function listUserTables(db: AppDb): string[] {
  const rows = db.$client.prepare(
    `SELECT name FROM sqlite_master
    WHERE type='table' AND name NOT LIKE 'sqlite_%'
    ORDER BY name`,
  )
    .all() as { name: string }[];
  return rows.map(r => r.name);
};
