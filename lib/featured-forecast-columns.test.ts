import { describe, expect, test } from 'vitest';
import { featuredForecastSlotCount } from './featured-forecast-columns';

describe('featuredForecastSlotCount', () => {
  test('given narrow viewport, should fit one card per row', () => {
    expect(featuredForecastSlotCount(390)).toBe(1);
    expect(featuredForecastSlotCount(1023)).toBe(1);
  });

  test('given large viewport, should fit three cards per row', () => {
    expect(featuredForecastSlotCount(1024)).toBe(3);
    expect(featuredForecastSlotCount(1279)).toBe(3);
  });

  test('given extra-large viewport, should fit four cards per row', () => {
    expect(featuredForecastSlotCount(1280)).toBe(4);
    expect(featuredForecastSlotCount(1600)).toBe(4);
  });
});
