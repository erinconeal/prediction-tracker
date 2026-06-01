import { describe, expect, test } from 'vitest';
import { humanizeSlug } from './humanize-slug';

describe('humanizeSlug', () => {
  test('given hyphenated slug, should title-case each word', () => {
    expect(humanizeSlug('jane-analyst')).toBe('Jane Analyst');
  });

  test('given empty segments, should return original slug', () => {
    expect(humanizeSlug('')).toBe('');
    expect(humanizeSlug('---')).toBe('---');
  });

  test('given single segment, should capitalize first letter only', () => {
    expect(humanizeSlug('forecast')).toBe('Forecast');
  });
});
