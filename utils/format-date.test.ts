import { describe, expect, test } from 'vitest';
import { formatMonthYear, formatResolvedRelativeTime } from './format-date';

describe('formatMonthYear', () => {
  test('given ISO instant, should include calendar year', () => {
    const s = formatMonthYear('2026-12-31T00:00:00.000Z');
    expect(s).toContain('2026');
    expect(s.length).toBeGreaterThan(3);
  });

  test('given invalid string, should echo input', () => {
    expect(formatMonthYear('not-a-date')).toBe('not-a-date');
  });
});

describe('formatResolvedRelativeTime', () => {
  const now = new Date('2026-05-31T14:00:00.000Z');

  test('given under one minute, should return just now', () => {
    expect(
      formatResolvedRelativeTime('2026-05-31T13:59:30.000Z', now),
    ).toBe('just now');
  });

  test('given under one hour, should return minutes ago', () => {
    expect(
      formatResolvedRelativeTime('2026-05-31T13:45:00.000Z', now),
    ).toBe('15m ago');
  });

  test('given same calendar day, should return hours ago', () => {
    expect(
      formatResolvedRelativeTime('2026-05-31T10:00:00.000Z', now),
    ).toBe('4h ago');
  });

  test('given previous calendar day, should return Yesterday', () => {
    expect(
      formatResolvedRelativeTime('2026-05-30T20:00:00.000Z', now),
    ).toBe('Yesterday');
  });

  test('given older than yesterday, should return short date', () => {
    const result = formatResolvedRelativeTime('2026-05-28T12:00:00.000Z', now);
    expect(result).toContain('2026');
    expect(result).toContain('28');
  });

  test('given invalid string, should echo input', () => {
    expect(formatResolvedRelativeTime('not-a-date', now)).toBe('not-a-date');
  });

  test('given a future timestamp, should return a formatted date', () => {
    expect(
      formatResolvedRelativeTime('2026-06-01T00:00:00.000Z', now),
    ).toBe('Jun 1, 2026');
  });
});
