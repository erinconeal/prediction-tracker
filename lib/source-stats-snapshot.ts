/** Max predictions loaded for source sidebar stats (API cap). */
export const SOURCE_STATS_SNAPSHOT_LIMIT = 100;

export const sourceStatsSnapshotCappedCopy
  = 'Counts use the first 100 predictions. Sources with more show 100+ on total.';

export function isSourceStatsSnapshotCapped(
  loadedCount: number,
  limit = SOURCE_STATS_SNAPSHOT_LIMIT,
): boolean {
  return loadedCount >= limit;
}

export function formatSourceStatCountDisplay(
  value: number,
  options: { snapshotCapped: boolean; limit?: number },
): string {
  const limit = options.limit ?? SOURCE_STATS_SNAPSHOT_LIMIT;
  if (options.snapshotCapped && value >= limit) {
    return `${limit}+`;
  }
  return String(value);
}
