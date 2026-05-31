import { describe, expect, test } from 'vitest';
import { formatCompactCount } from './format-compact-count';
import { formatTrackedCount } from './feed-platform-stats';

describe('formatTrackedCount', () => {
  test('matches formatCompactCount rules', () => {
    for (const n of [42, 999, 1000, 4300, 10_499, 1_000_000]) {
      expect(formatTrackedCount(n)).toBe(formatCompactCount(n));
    }
  });
});
