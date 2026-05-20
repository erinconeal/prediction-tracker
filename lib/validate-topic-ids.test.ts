import { describe, expect, test } from 'vitest';
import { listTopics } from '@/lib/topic-store';
import { findUnknownTopicIds } from './validate-topic-ids';

describe('findUnknownTopicIds', () => {
  test('given only known topic ids, should return an empty list', () => {
    const known = listTopics()[0]!.id;
    expect(findUnknownTopicIds([known])).toEqual([]);
  });

  test('given unknown topic ids, should return those ids', () => {
    expect(findUnknownTopicIds(['not-a-real-topic-id'])).toEqual([
      'not-a-real-topic-id',
    ]);
  });
});
