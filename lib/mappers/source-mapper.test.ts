import { describe, expect, test } from 'vitest';
import { toSourceInsert } from './source-mapper';
import { slugify } from '@/utils/slugify';

describe('toSourceInsert', () => {
  test('given whitespace around displayName, should trim', () => {
    const input = '  Jane Analyst  ';
    const expected = {
      id: expect.any(String),
      slug: 'jane-analyst',
      displayName: 'Jane Analyst',
      profileUrl: null,
      active: true,
    };
    expect(toSourceInsert(input)).toEqual(expected);
  });

  test('given id, should return with source string prefix', () => {
    const input = 'Jane Analyst';
    const expected = {
      id: `source-${slugify(input.trim())}`,
      slug: 'jane-analyst',
      displayName: 'Jane Analyst',
      profileUrl: null,
      active: true,
    };
    expect(toSourceInsert(input)).toEqual(expected);
  });

  test('given slug, should match slugify output', () => {
    const input = 'Jane Analyst';
    const expected = slugify(input.trim());
    expect(toSourceInsert(input).slug).toEqual(expected);
  });

  test('returns empty profileUrl and active true', () => {
    const input = 'Jane Analyst';
    const expected = {
      id: expect.any(String),
      slug: 'jane-analyst',
      displayName: 'Jane Analyst',
      profileUrl: null,
      active: true,
    };
    expect(toSourceInsert(input)).toEqual(expected);
  });
});
