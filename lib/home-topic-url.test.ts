import { describe, expect, test } from 'vitest';
import type { TopicSlugLookup } from './home-topic-url';
import {
  buildHomeBrowseHref,
  homeTopicQueryValue,
  resolveHomeTopicQuery,
  topicBucketTabFromSearchParam,
} from './home-topic-url';

const lookup: TopicSlugLookup = async (slug) => {
  if (slug === 'ai-regulation-2026') {
    return { slug: 'ai-regulation-2026', kind: 'curated' };
  }
  if (slug === 'finance') {
    return { slug: 'finance', kind: 'bucket' };
  }
  return null;
};

describe('home-topic-url', () => {
  test('given null topic query, should map to undefined tab', () => {
    expect(topicBucketTabFromSearchParam(null)).toBeUndefined();
    expect(topicBucketTabFromSearchParam('')).toBeUndefined();
  });

  test('given finance slug, should map to Finance tab', () => {
    expect(topicBucketTabFromSearchParam('finance')).toBe('Finance');
    expect(topicBucketTabFromSearchParam('FINANCE')).toBe('Finance');
  });

  test('given unknown slug, should return undefined', () => {
    expect(topicBucketTabFromSearchParam('crypto')).toBeUndefined();
  });

  test('given All tab, should omit topic query value', () => {
    expect(homeTopicQueryValue('All')).toBeNull();
  });

  test('given Finance tab, should use finance slug in query', () => {
    expect(homeTopicQueryValue('Finance')).toBe('finance');
  });

  test('given Finance tab, should build home href with topic query', () => {
    expect(buildHomeBrowseHref('/', 'Finance')).toBe('/?topic=finance');
  });

  test('given All tab on home, should build path without topic query', () => {
    expect(buildHomeBrowseHref('/', 'All')).toBe('/');
    expect(buildHomeBrowseHref('/', 'All', new URLSearchParams('topic=finance')))
      .toBe('/');
  });

  test('given empty topic query, should resolve to All tab', async () => {
    expect(await resolveHomeTopicQuery(null, lookup)).toEqual({
      kind: 'tab',
      tab: 'All',
    });
    expect(await resolveHomeTopicQuery('', lookup)).toEqual({
      kind: 'tab',
      tab: 'All',
    });
  });

  test('given finance slug, should resolve to Finance tab', async () => {
    expect(await resolveHomeTopicQuery('finance', lookup)).toEqual({
      kind: 'tab',
      tab: 'Finance',
    });
  });

  test('given curated topic slug, should resolve to redirect', async () => {
    expect(await resolveHomeTopicQuery('ai-regulation-2026', lookup)).toEqual({
      kind: 'redirect',
      href: '/ai-regulation-2026',
    });
  });

  test('given unknown slug, should resolve to strip', async () => {
    expect(await resolveHomeTopicQuery('crypto', lookup)).toEqual({
      kind: 'strip',
    });
  });
});
