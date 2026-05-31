import { describe, expect, test } from 'vitest';
import { formatCompactCount } from './format-compact-count';

describe('formatCompactCount', () => {
  test('returns plain string below 1000', () => {
    expect(formatCompactCount(999)).toBe('999');
    expect(formatCompactCount(42)).toBe('42');
  });

  test('formats thousands with one decimal from 1k upward', () => {
    expect(formatCompactCount(1000)).toBe('1k');
    expect(formatCompactCount(4300)).toBe('4.3k');
    expect(formatCompactCount(9999)).toBe('10k');
    expect(formatCompactCount(10_000)).toBe('10k');
    expect(formatCompactCount(10_499)).toBe('10.5k');
    expect(formatCompactCount(999_999)).toBe('1000k');
  });

  test('formats millions with one decimal under 10m', () => {
    expect(formatCompactCount(1_000_000)).toBe('1m');
    expect(formatCompactCount(4_300_000)).toBe('4.3m');
    expect(formatCompactCount(9_999_500)).toBe('10m');
  });

  test('formats millions as whole numbers from 10m upward', () => {
    expect(formatCompactCount(10_000_000)).toBe('10m');
  });
});
