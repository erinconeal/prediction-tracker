import { describe, expect, test } from 'vitest';
import { buildPrediction } from '@/test/factories/prediction';
import { sourceFeedCardDate } from './source-feed-card-date';
import {
  TIMELINE_FINISHED_LABEL,
  TIMELINE_SUBMITTED_LABEL,
} from '@/lib/lifecycle-copy';

describe('sourceFeedCardDate', () => {
  test('given still open, should use Submitted and created_at', () => {
    expect(
      sourceFeedCardDate(
        buildPrediction({
          outcome: 'still_open',
          created_at: '2024-06-01T00:00:00.000Z',
          finished_at: null,
        }),
      ),
    ).toEqual({
      label: TIMELINE_SUBMITTED_LABEL,
      iso: '2024-06-01T00:00:00.000Z',
    });
  });

  test('given terminal outcome with finished_at, should use Finished and finished_at', () => {
    expect(
      sourceFeedCardDate(
        buildPrediction({
          outcome: 'correct',
          created_at: '2024-06-01T00:00:00.000Z',
          finished_at: '2024-07-15T00:00:00.000Z',
        }),
      ),
    ).toEqual({
      label: TIMELINE_FINISHED_LABEL,
      iso: '2024-07-15T00:00:00.000Z',
    });
  });

  test('given terminal outcome without finished_at, should return null', () => {
    expect(
      sourceFeedCardDate(
        buildPrediction({
          outcome: 'incorrect',
          created_at: '2024-06-01T00:00:00.000Z',
          finished_at: null,
        }),
      ),
    ).toBeNull();
  });

  test('given still open with invalid created_at, should return null', () => {
    expect(
      sourceFeedCardDate(
        buildPrediction({
          outcome: 'still_open',
          created_at: 'not-a-date',
          finished_at: null,
        }),
      ),
    ).toBeNull();
  });

  test('given unresolved with finished_at, should use Finished and finished_at', () => {
    expect(
      sourceFeedCardDate(
        buildPrediction({
          outcome: 'unresolved',
          finished_at: '2024-08-01T00:00:00.000Z',
        }),
      ),
    ).toEqual({
      label: TIMELINE_FINISHED_LABEL,
      iso: '2024-08-01T00:00:00.000Z',
    });
  });

  test('given invalid outcome with finished_at, should use Finished and finished_at', () => {
    expect(
      sourceFeedCardDate(
        buildPrediction({
          outcome: 'invalid',
          finished_at: '2024-08-02T00:00:00.000Z',
        }),
      ),
    ).toEqual({
      label: TIMELINE_FINISHED_LABEL,
      iso: '2024-08-02T00:00:00.000Z',
    });
  });

  test('given terminal outcome with invalid finished_at, should return null', () => {
    expect(
      sourceFeedCardDate(
        buildPrediction({
          outcome: 'correct',
          finished_at: 'not-a-date',
        }),
      ),
    ).toBeNull();
  });
});
