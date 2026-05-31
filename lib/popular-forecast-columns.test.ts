import { describe, expect, test } from 'vitest';
import { popularForecastSlotCount } from './popular-forecast-columns';

describe('popularForecastSlotCount', () => {
  test('returns 1 below lg breakpoint', () => {
    expect(popularForecastSlotCount(390)).toBe(1);
    expect(popularForecastSlotCount(1023)).toBe(1);
  });

  test('returns 3 from lg up to xl', () => {
    expect(popularForecastSlotCount(1024)).toBe(3);
    expect(popularForecastSlotCount(1279)).toBe(3);
  });

  test('returns 4 at xl and above', () => {
    expect(popularForecastSlotCount(1280)).toBe(4);
    expect(popularForecastSlotCount(1600)).toBe(4);
  });
});
