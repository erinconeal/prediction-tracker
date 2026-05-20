import { describe, expect, test } from 'vitest';
import {
  categoryFromCategoryTab,
  categoryTabFromName,
} from './category-tabs';

describe('category-tabs', () => {
  test('categoryFromCategoryTab returns undefined for All', () => {
    expect(categoryFromCategoryTab('All')).toBeUndefined();
    expect(categoryFromCategoryTab('Finance')).toBe('Finance');
  });

  test('categoryTabFromName maps known categories', () => {
    expect(categoryTabFromName('tech')).toBe('Tech');
    expect(categoryTabFromName('Weather')).toBe('Weather');
    expect(categoryTabFromName('unknown')).toBeUndefined();
  });
});
