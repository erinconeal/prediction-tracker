import Database from 'better-sqlite3';
import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

export type AppDb = BetterSQLite3Database<typeof schema> & {
  $client: Database.Database;
};

const DEFAULT_DATABASE_URL = './data/prediction-tracker.sqlite';

const globalForDb = globalThis as typeof globalThis & {
  __predictionTrackerSqlite?: Database.Database;
  __predictionTrackerDb?: AppDb;
};

function openSqlite(url: string): Database.Database {
  const conn = new Database(url);
  conn.pragma('foreign_keys = ON');
  return conn;
}

/** Explicit factory -- tests, seeds, scripts, :memory: */
export function createDb(url: string = process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL): AppDb {
  return drizzle(openSqlite(url), { schema });
};

function getSqlite(): Database.Database {
  if (!globalForDb.__predictionTrackerSqlite) {
    const url = process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL;
    globalForDb.__predictionTrackerSqlite = openSqlite(url);
  }
  return globalForDb.__predictionTrackerSqlite;
}

/** App singleton - used in API routes and repositories */
export function getDb(): AppDb {
  if (!globalForDb.__predictionTrackerDb) {
    globalForDb.__predictionTrackerDb = drizzle(getSqlite(), { schema });
  }
  return globalForDb.__predictionTrackerDb;
}
