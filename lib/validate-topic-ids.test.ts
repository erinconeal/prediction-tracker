import { describe, expect, test } from 'vitest';
import { listTopics } from '@/lib/repositories/topic-repository';
import { findUnknownTopicIds } from './validate-topic-ids';

describe('findUnknownTopicIds', () => {
  test('given only known topic ids, should return an empty list', async () => {
    const known = (await listTopics())[0]!.id;
    expect(await findUnknownTopicIds([known])).toEqual([]);
  });

  test('given unknown topic ids, should return those ids', async () => {
    expect(await findUnknownTopicIds(['not-a-real-topic-id'])).toEqual([
      'not-a-real-topic-id',
    ]);
  });
});
