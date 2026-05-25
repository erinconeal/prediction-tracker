import { describe, expect, test } from 'vitest';
import {
  buildHomeBrowseHref,
  categoryTabFromSearchParam,
  homeCategoryQueryValue,
} from './home-category-url';

describe('home-category-url', () => {
  test('given null category query, should map to undefined tab', () => {
    expect(categoryTabFromSearchParam(null)).toBeUndefined();
    expect(categoryTabFromSearchParam('')).toBeUndefined();
  });

  test('given finance slug, should map to Finance tab', () => {
    expect(categoryTabFromSearchParam('finance')).toBe('Finance');
    expect(categoryTabFromSearchParam('FINANCE')).toBe('Finance');
  });

  test('given unknown slug, should map to undefined tab', () => {
    expect(categoryTabFromSearchParam('crypto')).toBeUndefined();
  });

  test('given All tab, should omit category query value', () => {
    expect(homeCategoryQueryValue('All')).toBeNull();
  });

  test('given Finance tab, should use lowercase slug query value', () => {
    expect(homeCategoryQueryValue('Finance')).toBe('finance');
  });

  test('given Finance tab on home, should build shareable browse href', () => {
    expect(buildHomeBrowseHref('/', 'Finance')).toBe('/?category=finance');
  });

  test('given All tab on home, should build path without category query', () => {
    expect(buildHomeBrowseHref('/', 'All')).toBe('/');
    expect(buildHomeBrowseHref('/', 'All', new URLSearchParams('category=finance')))
      .toBe('/');
  });
});
