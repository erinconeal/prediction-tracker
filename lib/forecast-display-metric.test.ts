import { describe, expect, test } from 'vitest';
import {
  forecastDisplayMetricFromStats,
  sourceAccuracyBadgeAriaLabel,
  sourceAccuracyBadgeVisibleText,
} from './forecast-display-metric';
import type { SourceAccuracyStats } from './source-stats';

function stats(accuracy: number | null): SourceAccuracyStats {
  return {
    name: 'Test',
    total: 10,
    stillOpen: 0,
    scored: accuracy === null ? 0 : 8,
    correct: accuracy === null ? 0 : 6,
    outcomeUnresolved: 0,
    invalid: 0,
    noLongerOpen: 10,
    accuracy,
  };
}

describe('forecastDisplayMetricFromStats', () => {
  test('maps high accuracy to up trend', () => {
    expect(forecastDisplayMetricFromStats(stats(82))).toEqual({
      percent: 82,
      trend: 'up',
    });
  });

  test('maps low accuracy to down trend', () => {
    expect(forecastDisplayMetricFromStats(stats(14))).toEqual({
      percent: 14,
      trend: 'down',
    });
  });

  test('maps mid accuracy to flat trend', () => {
    expect(forecastDisplayMetricFromStats(stats(49))).toEqual({
      percent: 49,
      trend: 'flat',
    });
  });

  test('given no scored accuracy, should use flat trend without percent', () => {
    expect(forecastDisplayMetricFromStats(stats(null))).toEqual({
      percent: null,
      trend: 'flat',
    });
  });
});

describe('sourceAccuracyBadgeVisibleText', () => {
  test('formats high, low, mid, and unavailable metrics', () => {
    expect(
      sourceAccuracyBadgeVisibleText({ percent: 82, trend: 'up' }),
    ).toBe('82% ↑');
    expect(
      sourceAccuracyBadgeVisibleText({ percent: 14, trend: 'down' }),
    ).toBe('14% ↓');
    expect(
      sourceAccuracyBadgeVisibleText({ percent: 49, trend: 'flat' }),
    ).toBe('49% —');
    expect(
      sourceAccuracyBadgeVisibleText({ percent: null, trend: 'flat' }),
    ).toBe('—');
  });
});

describe('sourceAccuracyBadgeAriaLabel', () => {
  test('describes track record strength without market trend language', () => {
    expect(
      sourceAccuracyBadgeAriaLabel({ percent: 82, trend: 'up' }),
    ).toBe('Source accuracy 82 percent, strong track record');
    expect(
      sourceAccuracyBadgeAriaLabel({ percent: null, trend: 'flat' }),
    ).toBe('Source accuracy unavailable for this source');
  });
});
