import { describe, expect, test } from 'vitest';
import { pickRecentScoredResolutions } from './recent-resolutions';
import { buildPrediction } from '@/test/factories/prediction';

describe('pickRecentScoredResolutions', () => {
  test('given scored terminal outcomes, should return newest first', () => {
    const items = pickRecentScoredResolutions([
      buildPrediction({
        id: 'older',
        outcome: 'correct',
        resolved_at: '2024-01-01T00:00:00.000Z',
      }),
      buildPrediction({
        id: 'newer',
        outcome: 'incorrect',
        resolved_at: '2024-01-03T00:00:00.000Z',
      }),
    ]);

    expect(items.map(i => i.prediction.id)).toEqual(['newer', 'older']);
  });

  test('given unresolved or invalid outcomes, should exclude them', () => {
    const items = pickRecentScoredResolutions([
      buildPrediction({
        id: 'unresolved',
        outcome: 'unresolved',
        resolved_at: '2024-01-05T00:00:00.000Z',
      }),
      buildPrediction({
        id: 'invalid',
        outcome: 'invalid',
        resolved_at: '2024-01-04T00:00:00.000Z',
      }),
      buildPrediction({
        id: 'correct',
        outcome: 'correct',
        resolved_at: '2024-01-02T00:00:00.000Z',
      }),
    ]);

    expect(items.map(i => i.prediction.id)).toEqual(['correct']);
  });

  test('given pending predictions, should exclude them', () => {
    const items = pickRecentScoredResolutions([
      buildPrediction({ id: 'pending', outcome: 'pending', resolved_at: null }),
      buildPrediction({
        id: 'correct',
        outcome: 'correct',
        resolved_at: '2024-01-02T00:00:00.000Z',
      }),
    ]);

    expect(items.map(i => i.prediction.id)).toEqual(['correct']);
  });

  test('given scored outcomes without resolved_at, should exclude them', () => {
    const items = pickRecentScoredResolutions([
      buildPrediction({
        id: 'missing-date',
        outcome: 'correct',
        resolved_at: null,
      }),
      buildPrediction({
        id: 'dated',
        outcome: 'correct',
        resolved_at: '2024-01-02T00:00:00.000Z',
      }),
    ]);

    expect(items.map(i => i.prediction.id)).toEqual(['dated']);
  });

  test('given more items than the limit, should return only the newest', () => {
    const items = pickRecentScoredResolutions(
      [
        buildPrediction({
          id: 'oldest',
          outcome: 'correct',
          resolved_at: '2024-01-01T00:00:00.000Z',
        }),
        buildPrediction({
          id: 'middle',
          outcome: 'incorrect',
          resolved_at: '2024-01-02T00:00:00.000Z',
        }),
        buildPrediction({
          id: 'newest',
          outcome: 'correct',
          resolved_at: '2024-01-03T00:00:00.000Z',
        }),
      ],
      2,
    );

    expect(items.map(i => i.prediction.id)).toEqual(['newest', 'middle']);
  });

  test('given equal resolved_at, should break ties by created_at', () => {
    const items = pickRecentScoredResolutions([
      buildPrediction({
        id: 'b',
        outcome: 'correct',
        created_at: '2024-01-01T00:00:00.000Z',
        resolved_at: '2024-01-05T00:00:00.000Z',
      }),
      buildPrediction({
        id: 'a',
        outcome: 'incorrect',
        created_at: '2024-01-04T00:00:00.000Z',
        resolved_at: '2024-01-05T00:00:00.000Z',
      }),
    ]);

    expect(items.map(i => i.prediction.id)).toEqual(['a', 'b']);
  });
});
