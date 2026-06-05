import { describe, expect, test } from 'vitest';
import { buildTimelineSteps } from './prediction-lifecycle-timeline';

describe('buildTimelineSteps', () => {
  test('given still_open without target, should return added then outcome', () => {
    expect(buildTimelineSteps('still_open', null, null)).toEqual([
      'added',
      'outcome',
    ]);
  });

  test('given still_open with target, should place outcome before target', () => {
    expect(
      buildTimelineSteps('still_open', '2026-12-01T00:00:00.000Z', null),
    ).toEqual(['added', 'outcome', 'target']);
  });

  test('given terminal prediction with target and finished, should return chronological steps', () => {
    expect(
      buildTimelineSteps(
        'correct',
        '2026-12-01T00:00:00.000Z',
        '2024-07-15T00:00:00.000Z',
      ),
    ).toEqual(['added', 'target', 'finished', 'outcome']);
  });

  test('given terminal prediction without target, should omit target step', () => {
    expect(
      buildTimelineSteps('incorrect', null, '2024-07-15T00:00:00.000Z'),
    ).toEqual(['added', 'finished', 'outcome']);
  });

  test('given terminal prediction without finished_at, should omit finished step', () => {
    expect(
      buildTimelineSteps('unresolved', '2026-12-01T00:00:00.000Z', null),
    ).toEqual(['added', 'target', 'outcome']);
  });

  test('given terminal prediction without target or finished, should return added then outcome', () => {
    expect(buildTimelineSteps('invalid', null, null)).toEqual([
      'added',
      'outcome',
    ]);
  });
});
