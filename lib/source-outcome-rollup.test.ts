import { describe, expect, test } from 'vitest';
import type { Prediction } from '@/types/prediction';
import {
  accuracyPercentFromRollup,
  addPredictionToRollup,
  emptySourceOutcomeRollup,
  rollupBySource,
} from './source-outcome-rollup';

function row(overrides: Partial<Prediction> = {}): Prediction {
  return {
    id: '1',
    source: 'Jane',
    sourceSlug: 'jane',
    text: 'Prediction text',
    topicIds: [],
    created_at: '2024-01-01T00:00:00.000Z',
    resolved_at: null,
    target_date: null,
    outcome: 'pending',
    ...overrides,
  };
}

describe('emptySourceOutcomeRollup', () => {
  test('should return zeroed rollup', () => {
    expect(emptySourceOutcomeRollup()).toEqual({
      total: 0,
      pending: 0,
      scored: 0,
      correct: 0,
      outcomeUnresolved: 0,
      invalid: 0,
    });
  });
});

describe('addPredictionToRollup', () => {
  test('given pending, should increment total and pending only', () => {
    const r = emptySourceOutcomeRollup();
    addPredictionToRollup(r, row({ outcome: 'pending' }));
    expect(r).toMatchObject({
      total: 1,
      pending: 1,
      scored: 0,
      correct: 0,
      outcomeUnresolved: 0,
      invalid: 0,
    });
  });

  test('given correct, should increment scored and correct', () => {
    const r = emptySourceOutcomeRollup();
    addPredictionToRollup(r, row({ outcome: 'correct' }));
    expect(r).toMatchObject({
      total: 1,
      pending: 0,
      scored: 1,
      correct: 1,
      outcomeUnresolved: 0,
      invalid: 0,
    });
  });

  test('given incorrect, should increment scored but not correct', () => {
    const r = emptySourceOutcomeRollup();
    addPredictionToRollup(r, row({ outcome: 'incorrect' }));
    expect(r).toMatchObject({
      total: 1,
      pending: 0,
      scored: 1,
      correct: 0,
      outcomeUnresolved: 0,
      invalid: 0,
    });
  });

  test('given unresolved, should increment outcomeUnresolved', () => {
    const r = emptySourceOutcomeRollup();
    addPredictionToRollup(r, row({ outcome: 'unresolved' }));
    expect(r).toMatchObject({
      total: 1,
      pending: 0,
      scored: 0,
      correct: 0,
      outcomeUnresolved: 1,
      invalid: 0,
    });
  });

  test('given invalid, should increment invalid', () => {
    const r = emptySourceOutcomeRollup();
    addPredictionToRollup(r, row({ outcome: 'invalid' }));
    expect(r).toMatchObject({
      total: 1,
      pending: 0,
      scored: 0,
      correct: 0,
      outcomeUnresolved: 0,
      invalid: 1,
    });
  });
});

describe('accuracyPercentFromRollup', () => {
  test('given scored zero, should return null', () => {
    expect(accuracyPercentFromRollup(emptySourceOutcomeRollup())).toBeNull();
    const r = emptySourceOutcomeRollup();
    r.total = 2;
    r.outcomeUnresolved = 2;
    expect(accuracyPercentFromRollup(r)).toBeNull();
  });

  test('given scored rows, should return one decimal percent', () => {
    const r = emptySourceOutcomeRollup();
    r.scored = 3;
    r.correct = 1;
    expect(accuracyPercentFromRollup(r)).toBe(33.3);
  });
});

describe('rollupBySource', () => {
  test('given mixed sources, should aggregate per source', () => {
    const m = rollupBySource([
      row({ id: 'a', source: 'A', outcome: 'correct' }),
      row({ id: 'b', source: 'A', outcome: 'incorrect' }),
      row({ id: 'c', source: 'B', outcome: 'pending' }),
    ]);
    expect(m.get('A')).toMatchObject({
      total: 2,
      pending: 0,
      scored: 2,
      correct: 1,
    });
    expect(m.get('B')).toMatchObject({
      total: 1,
      pending: 1,
      scored: 0,
      correct: 0,
    });
  });
});
