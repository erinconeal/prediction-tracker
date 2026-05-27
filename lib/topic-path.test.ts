import { describe, expect, test } from 'vitest';
import {
  isReservedTopicSlug,
  topicPagePath,
  RESERVED_ROOT_SEGMENTS,
} from '@/lib/topic-path';

describe('topicPagePath', () => {
  test('given slug, should return root path', () => {
    expect(topicPagePath('finance')).toBe('/finance');
    expect(topicPagePath('ai-regulation-2026')).toBe('/ai-regulation-2026');
    expect(topicPagePath('Finance')).toBe('/finance');
  });

  test('given reserved segment, should throw', () => {
    expect(() => topicPagePath('about')).toThrow(/invalid topic slug/i);
    expect(() => topicPagePath('predictions')).toThrow(/invalid topic slug/i);
  });

  test('given empty slug, should throw', () => {
    expect(() => topicPagePath('')).toThrow(/invalid topic slug/i);
    expect(() => topicPagePath('   ')).toThrow(/invalid topic slug/i);
  });
});

describe('reserved segments vs topicPagePath', () => {
  test('given every reserved segment, topicPagePath should reject', () => {
    for (const segment of RESERVED_ROOT_SEGMENTS) {
      expect(isReservedTopicSlug(segment)).toBe(true);
      expect(() => topicPagePath(segment)).toThrow(/invalid topic slug/i);
    }
  });
});

describe('isReservedTopicSlug', () => {
  test('given reserved segment, should return true', () => {
    expect(isReservedTopicSlug('about')).toBe(true);
    expect(isReservedTopicSlug('API')).toBe(true);
  });

  test('given topic slug, should return false', () => {
    expect(isReservedTopicSlug('finance')).toBe(false);
  });
});
