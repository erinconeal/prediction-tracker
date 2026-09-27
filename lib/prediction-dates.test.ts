import { describe, expect, test } from 'vitest';
import { isDeadlineDateAfterDateSaid } from './prediction-dates';

describe('isDeadlineDateAfterDateSaid', () => {
  test('given the same calendar day, should return false', () => {
    expect(isDeadlineDateAfterDateSaid('2026-01-01', '2026-01-01')).toBe(false);
  });

  test('given a deadline before the date said, should return false', () => {
    expect(isDeadlineDateAfterDateSaid('2026-01-01', '2026-01-02')).toBe(false);
  });

  test('given a deadline after the date said, should return true', () => {
    expect(isDeadlineDateAfterDateSaid('2026-01-02', '2026-01-01')).toBe(true);
  });
});
