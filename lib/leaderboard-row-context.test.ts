import { describe, expect, test } from 'vitest';
import { buildLeaderboardRow } from '@/test/factories/leaderboard-row';
import { formatLeaderboardAccuracyContext } from './leaderboard-row-context';

describe('formatLeaderboardAccuracyContext', () => {
  test('given scored row with pending, should include both', () => {
    const text = formatLeaderboardAccuracyContext(
      buildLeaderboardRow({
        scored: 5,
        pending: 2,
        outcomeUnresolved: 0,
        invalid: 0,
      }),
    );
    expect(text).toBe('5 scored (correct + incorrect) · 2 pending');
  });

  test('given unresolved and invalid, should surface both', () => {
    const text = formatLeaderboardAccuracyContext(
      buildLeaderboardRow({
        scored: 3,
        pending: 0,
        outcomeUnresolved: 1,
        invalid: 2,
      }),
    );
    expect(text).toContain('3 scored');
    expect(text).toContain('1 unresolved');
    expect(text).toContain('2 invalid');
  });
});
