import { describe, expect, test } from 'vitest';
import { buildTopic } from '@/test/factories/topic';
import {
  pickDisplayBucketTopic,
  pickPrimaryTopicFromLinked,
} from './topic-primary';

describe('pickPrimaryTopicFromLinked', () => {
  test('given empty list, should return null', () => {
    expect(pickPrimaryTopicFromLinked([])).toBeNull();
  });

  test('given only curated topics, should pick first curated', () => {
    const curated = buildTopic({ id: 'c-1', slug: 'curated', name: 'Curated', kind: 'curated' });
    const result = pickPrimaryTopicFromLinked([curated]);
    expect(result).toBe(curated);
  });

  test('given only bucket topics, should pick first bucket', () => {
    const bucket = buildTopic({ id: 'b-1', slug: 'bucket', name: 'Bucket', kind: 'bucket' });
    const result = pickPrimaryTopicFromLinked([bucket]);
    expect(result).toBe(bucket);
  });

  test('given curated and bucket topics, should prefer curated', () => {
    const bucket = buildTopic({ id: 'b-1', slug: 'bucket', name: 'Bucket', kind: 'bucket' });
    const curated = buildTopic({ id: 'c-1', slug: 'curated', name: 'Curated', kind: 'curated' });
    const result = pickPrimaryTopicFromLinked([bucket, curated]);
    expect(result).toBe(curated);
  });
});

describe('pickDisplayBucketTopic', () => {
  test('given primary is bucket only, should return null', () => {
    const bucket = buildTopic({ id: 'b-1', slug: 'politics', name: 'Politics', kind: 'bucket' });
    expect(pickDisplayBucketTopic([bucket], bucket, [])).toBeNull();
  });

  test('given curated with parent buckets, should return first parent', () => {
    const politics = buildTopic({ id: 'b-pol', slug: 'politics', name: 'Politics', kind: 'bucket' });
    const curated = buildTopic({
      id: 'c-1',
      slug: 'midterm',
      name: 'Midterm elections 2026',
      kind: 'curated',
      parentTopicIds: ['b-pol'],
    });
    expect(pickDisplayBucketTopic([curated], curated, [politics])).toBe(politics);
  });

  test('given curated and linked bucket, should prefer linked bucket', () => {
    const tech = buildTopic({ id: 'b-tech', slug: 'tech', name: 'Tech', kind: 'bucket' });
    const politics = buildTopic({ id: 'b-pol', slug: 'politics', name: 'Politics', kind: 'bucket' });
    const curated = buildTopic({
      id: 'c-1',
      kind: 'curated',
      parentTopicIds: ['b-pol', 'b-tech'],
    });
    expect(
      pickDisplayBucketTopic([politics, curated], curated, [politics, tech]),
    ).toBe(politics);
  });
});
