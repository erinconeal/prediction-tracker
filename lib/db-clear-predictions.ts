import { getDb, type AppDb } from '@/lib/db';
import { predictions, sources } from '@/lib/schema';

/**
 * Deletes all predictions (junction rows cascade) then all sources.
 * Topics are left in place. Does not re-seed demo data.
 */
export async function clearPredictions(db: AppDb = getDb()): Promise<void> {
  await db.delete(predictions).execute();
  await db.delete(sources).execute();
}
