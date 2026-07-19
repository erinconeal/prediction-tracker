import type Database from 'better-sqlite3';
import type { AppDb } from './db';

const globalForDb = globalThis as typeof globalThis & {
  __predictionTrackerSqlite?: Database.Database;
  __predictionTrackerDb?: AppDb;
};

export function resetDbSingletonForTests(): void {
  globalForDb.__predictionTrackerDb = undefined;
  globalForDb.__predictionTrackerSqlite?.close();
  globalForDb.__predictionTrackerSqlite = undefined;
}
