import { describe, expect, test } from 'vitest';
import { buildPrediction } from '@/test/factories/prediction';
import {
  browseForecastTiming,
  browseForecastTimingLine,
} from './browse-forecast-timing';

describe('browseForecastTimingLine', () => {
  test('given pending with target_date, should show Target with month year', () => {
    expect(
      browseForecastTimingLine(
        buildPrediction({
          outcome: 'pending',
          resolved_at: null,
          target_date: '2025-03-15T00:00:00.000Z',
        }),
      ),
    ).toMatch(/^Target Mar 2025$/);
  });

  test('given correct with resolved_at, should show Resolved', () => {
    expect(
      browseForecastTimingLine(
        buildPrediction({
          target_date: null,
          outcome: 'correct',
          resolved_at: '2024-07-15T00:00:00.000Z',
        }),
      ),
    ).toMatch(/^Resolved Jul 15, 2024$/);
  });

  test('given scored terminal with target_date and resolved_at, should prefer Resolved', () => {
    expect(
      browseForecastTimingLine(
        buildPrediction({
          target_date: '2026-06-01T00:00:00.000Z',
          outcome: 'incorrect',
          resolved_at: '2024-07-15T00:00:00.000Z',
        }),
      ),
    ).toMatch(/^Resolved Jul 15, 2024$/);
  });

  test('given unresolved with target_date and resolved_at, should prefer Closed', () => {
    expect(
      browseForecastTimingLine(
        buildPrediction({
          target_date: '2026-06-01T00:00:00.000Z',
          outcome: 'unresolved',
          resolved_at: '2024-07-15T00:00:00.000Z',
        }),
      ),
    ).toMatch(/^Closed Jul 15, 2024$/);
  });

  test('given scored terminal outcome with resolved_at and no target, should show Resolved', () => {
    expect(
      browseForecastTimingLine(
        buildPrediction({
          target_date: null,
          outcome: 'incorrect',
          resolved_at: '2024-07-15T00:00:00.000Z',
        }),
      ),
    ).toMatch(/^Resolved Jul 15, 2024$/);
  });

  test('given unresolved or invalid with resolved_at, should show Closed not Resolved', () => {
    expect(
      browseForecastTimingLine(
        buildPrediction({
          target_date: null,
          outcome: 'unresolved',
          resolved_at: '2024-07-15T00:00:00.000Z',
        }),
      ),
    ).toMatch(/^Closed Jul 15, 2024$/);

    expect(
      browseForecastTimingLine(
        buildPrediction({
          target_date: null,
          outcome: 'invalid',
          resolved_at: '2024-07-15T00:00:00.000Z',
        }),
      ),
    ).toMatch(/^Closed Jul 15, 2024$/);
  });

  test('given pending outcome without target, should show Added', () => {
    expect(
      browseForecastTimingLine(
        buildPrediction({
          target_date: null,
          outcome: 'pending',
          resolved_at: null,
          created_at: '2024-06-01T00:00:00.000Z',
        }),
      ),
    ).toMatch(/^Added Jun 1, 2024$/);
  });

  test('given pending with resolved_at set, should ignore resolved_at and show Target or Added', () => {
    expect(
      browseForecastTimingLine(
        buildPrediction({
          outcome: 'pending',
          resolved_at: '2024-07-15T00:00:00.000Z',
          target_date: '2025-03-15T00:00:00.000Z',
        }),
      ),
    ).toMatch(/^Target Mar 2025$/);

    expect(
      browseForecastTimingLine(
        buildPrediction({
          outcome: 'pending',
          resolved_at: '2024-07-15T00:00:00.000Z',
          target_date: null,
          created_at: '2024-06-01T00:00:00.000Z',
        }),
      ),
    ).toMatch(/^Added Jun 1, 2024$/);
  });

  test('given terminal outcome without resolved_at, should fall back to Target then Added', () => {
    expect(
      browseForecastTimingLine(
        buildPrediction({
          target_date: '2025-03-15T00:00:00.000Z',
          outcome: 'incorrect',
          resolved_at: null,
        }),
      ),
    ).toMatch(/^Target Mar 2025$/);

    expect(
      browseForecastTimingLine(
        buildPrediction({
          target_date: null,
          outcome: 'incorrect',
          resolved_at: null,
          created_at: '2024-06-01T00:00:00.000Z',
        }),
      ),
    ).toMatch(/^Added Jun 1, 2024$/);
  });
});

describe('browseForecastTiming', () => {
  test('given resolved row, should expose ISO dateTime for semantic time element', () => {
    expect(
      browseForecastTiming(
        buildPrediction({
          outcome: 'correct',
          resolved_at: '2024-07-15T00:00:00.000Z',
          target_date: null,
        }),
      ),
    ).toEqual({
      prefix: 'Resolved',
      dateTime: '2024-07-15T00:00:00.000Z',
      dateLabel: 'Jul 15, 2024',
    });
  });
});
