import { describe, expect, test } from 'vitest';
import { pickRecentlyJudgedScored } from './recently-judged-scored';
import { buildPrediction } from '@/test/factories/prediction';

describe('pickRecentlyJudgedScored', () => {
  test('given scored terminal outcomes, should return newest first', () => {
    const items = pickRecentlyJudgedScored([
      buildPrediction({
        id: 'older',
        outcome: 'correct',
        finished_at: '2024-01-01T00:00:00.000Z',
      }),
      buildPrediction({
        id: 'newer',
        outcome: 'incorrect',
        finished_at: '2024-01-03T00:00:00.000Z',
      }),
    ]);

    expect(items.map(i => i.prediction.id)).toEqual(['newer', 'older']);
  });

  test('given unresolved or invalid outcomes, should exclude them', () => {
    const items = pickRecentlyJudgedScored([
      buildPrediction({
        id: 'unresolved',
        outcome: 'unresolved',
        finished_at: '2024-01-05T00:00:00.000Z',
      }),
      buildPrediction({
        id: 'invalid',
        outcome: 'invalid',
        finished_at: '2024-01-04T00:00:00.000Z',
      }),
      buildPrediction({
        id: 'correct',
        outcome: 'correct',
        finished_at: '2024-01-02T00:00:00.000Z',
      }),
    ]);

    expect(items.map(i => i.prediction.id)).toEqual(['correct']);
  });

  test('given still_open predictions, should exclude them', () => {
    const items = pickRecentlyJudgedScored([
      buildPrediction({ id: 'still-open', outcome: 'still_open', finished_at: null }),
      buildPrediction({
        id: 'correct',
        outcome: 'correct',
        finished_at: '2024-01-02T00:00:00.000Z',
      }),
    ]);

    expect(items.map(i => i.prediction.id)).toEqual(['correct']);
  });

  test('given scored outcomes without finished_at, should exclude them', () => {
    const items = pickRecentlyJudgedScored([
      buildPrediction({
        id: 'missing-date',
        outcome: 'correct',
        finished_at: null,
      }),
      buildPrediction({
        id: 'dated',
        outcome: 'correct',
        finished_at: '2024-01-02T00:00:00.000Z',
      }),
    ]);

    expect(items.map(i => i.prediction.id)).toEqual(['dated']);
  });

  test('given more items than the limit, should return only the newest', () => {
    const items = pickRecentlyJudgedScored(
      [
        buildPrediction({
          id: 'oldest',
          outcome: 'correct',
          finished_at: '2024-01-01T00:00:00.000Z',
        }),
        buildPrediction({
          id: 'middle',
          outcome: 'incorrect',
          finished_at: '2024-01-02T00:00:00.000Z',
        }),
        buildPrediction({
          id: 'newest',
          outcome: 'correct',
          finished_at: '2024-01-03T00:00:00.000Z',
        }),
      ],
      2,
    );

    expect(items.map(i => i.prediction.id)).toEqual(['newest', 'middle']);
  });

  test('given equal finished_at, should break ties by created_at', () => {
    const items = pickRecentlyJudgedScored([
      buildPrediction({
        id: 'b',
        outcome: 'correct',
        created_at: '2024-01-01T00:00:00.000Z',
        finished_at: '2024-01-05T00:00:00.000Z',
      }),
      buildPrediction({
        id: 'a',
        outcome: 'incorrect',
        created_at: '2024-01-04T00:00:00.000Z',
        finished_at: '2024-01-05T00:00:00.000Z',
      }),
    ]);

    expect(items.map(i => i.prediction.id)).toEqual(['a', 'b']);
  });
});
