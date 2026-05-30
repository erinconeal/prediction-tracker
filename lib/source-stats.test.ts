import { describe, expect, test } from 'vitest';
import type { Prediction } from '@/types/prediction';
import { buildPrediction } from '@/test/factories/prediction';
import { computeSourceAccuracyStats } from './source-stats';

function row(overrides: Partial<Prediction> = {}): Prediction {
  return buildPrediction({
    id: '1',
    source: 'Jane',
    sourceSlug: 'jane',
    text: 'x',
    ...overrides,
  });
}

describe('computeSourceAccuracyStats', () => {
  test('given empty list, should use nameFallback', () => {
    expect(computeSourceAccuracyStats([], { nameFallback: 'slug' })).toEqual({
      name: 'slug',
      total: 0,
      pending: 0,
      scored: 0,
      correct: 0,
      outcomeUnresolved: 0,
      invalid: 0,
      resolved: 0,
      accuracy: null,
    });
  });

  test('given rows, should use first row source as display name', () => {
    const stats = computeSourceAccuracyStats(
      [row({ outcome: 'correct' }), row({ id: '2', outcome: 'incorrect' })],
      { nameFallback: 'ignored' },
    );
    expect(stats.name).toBe('Jane');
    expect(stats.total).toBe(2);
    expect(stats.pending).toBe(0);
    expect(stats.scored).toBe(2);
    expect(stats.resolved).toBe(2);
    expect(stats.accuracy).toBe(50);
  });

  test('given unresolved and invalid, should exclude them from accuracy denominator', () => {
    const stats = computeSourceAccuracyStats(
      [
        row({ id: '1', outcome: 'correct', resolved_at: '2024-01-02T00:00:00.000Z' }),
        row({ id: '2', outcome: 'unresolved', resolved_at: '2024-01-03T00:00:00.000Z' }),
        row({ id: '3', outcome: 'invalid', resolved_at: '2024-01-04T00:00:00.000Z' }),
      ],
      { nameFallback: 'x' },
    );
    expect(stats.scored).toBe(1);
    expect(stats.correct).toBe(1);
    expect(stats.accuracy).toBe(100);
    expect(stats.outcomeUnresolved).toBe(1);
    expect(stats.invalid).toBe(1);
    expect(stats.resolved).toBe(3);
  });

  test('given primaryName, should prefer over empty list', () => {
    const stats = computeSourceAccuracyStats([], {
      nameFallback: 'slug',
      primaryName: 'Loaded Name',
    });
    expect(stats.name).toBe('Loaded Name');
  });
});
