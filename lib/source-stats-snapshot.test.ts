import { describe, expect, test } from 'vitest';
import {
  SOURCE_STATS_SNAPSHOT_LIMIT,
  formatSourceStatCountDisplay,
  isSourceStatsSnapshotCapped,
  sourceStatsSnapshotCappedCopy,
} from './source-stats-snapshot';

describe('isSourceStatsSnapshotCapped', () => {
  test('given fewer than limit rows, should not be capped', () => {
    expect(isSourceStatsSnapshotCapped(99)).toBe(false);
  });

  test('given limit rows, should be capped', () => {
    expect(isSourceStatsSnapshotCapped(SOURCE_STATS_SNAPSHOT_LIMIT)).toBe(true);
  });
});

describe('formatSourceStatCountDisplay', () => {
  test('given capped snapshot and count at limit, should show 100+', () => {
    expect(
      formatSourceStatCountDisplay(100, { snapshotCapped: true }),
    ).toBe('100+');
  });

  test('given capped snapshot and count below limit, should show numeric value', () => {
    expect(formatSourceStatCountDisplay(42, { snapshotCapped: true })).toBe('42');
  });

  test('given uncapped snapshot, should show numeric value at limit', () => {
    expect(
      formatSourceStatCountDisplay(100, { snapshotCapped: false }),
    ).toBe('100');
  });
});

describe('sourceStatsSnapshotCappedCopy', () => {
  test('should mention 100+', () => {
    expect(sourceStatsSnapshotCappedCopy).toMatch(/100\+/);
  });
});
