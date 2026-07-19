import { eq } from 'drizzle-orm';
import { describe, expect, test } from 'vitest';
import {
  createMigratedTestDb,
  expectForeignKeysEnabled,
} from '@/test/helpers/create-test-db';
import {
  insertBucketTopic,
  insertPrediction,
  insertSource,
} from '@/test/helpers/db-fixtures';
import {
  predictionTopics,
  predictions,
  sources,
  topicParents,
  topics,
} from '@/lib/schema';

describe('database foreign keys', () => {
  test('given migrated db, when foreign_keys is queried, then enforcement is enabled', () => {
    const db = createMigratedTestDb();
    expectForeignKeysEnabled(db);
  });

  test('given valid fixture chain, when reading prediction topics, then link exists', async () => {
    const db = createMigratedTestDb();
    await insertBucketTopic(db, { id: 'topic-tech', slug: 'tech', name: 'Tech' });
    await insertSource(db, { id: 'source-jane', slug: 'jane-analyst', displayName: 'Jane Analyst' });
    await insertPrediction(db, { id: 'pred-1', sourceId: 'source-jane', text: 'test prediction', topicId: 'topic-tech' });
    const links = await db.select().from(predictionTopics);
    expect(links).toEqual([{ predictionId: 'pred-1', topicId: 'topic-tech' }]);
  });

  test('given no source row, when inserting prediction, then insert is rejected', async () => {
    const db = createMigratedTestDb();
    await expect(db.insert(predictions).values({
      id: 'pred-1',
      sourceId: 'missing-source',
      text: 'test prediction',
      createdAt: '2026-01-01T00:00:00.000Z',
      outcome: 'still_open',
    })).rejects.toThrow(/FOREIGN KEY constraint failed/i);
  });

  test('given no topic row, when inserting topic_parents link, then insert is rejected', async () => {
    const db = createMigratedTestDb();
    await expect(db.insert(topicParents).values({
      topicId: 'missing-child',
      parentTopicId: 'missing-parent',
    })).rejects.toThrow(/FOREIGN KEY constraint failed/i);
  });

  test('given source with predictions, when deleting source, then delete is rejected', async () => {
    const db = createMigratedTestDb();
    await insertBucketTopic(db, {
      id: 'topic-tech',
      slug: 'tech',
      name: 'Tech',
    });
    await insertSource(db, {
      id: 'source-jane',
      slug: 'jane-analyst',
      displayName: 'Jane Analyst',
    });
    await insertPrediction(db, {
      id: 'pred-1',
      sourceId: 'source-jane',
      text: 'test prediction',
      topicId: 'topic-tech',
    });

    await expect(db.delete(sources).where(eq(sources.id, 'source-jane'))).rejects.toThrow(/FOREIGN KEY constraint failed/i);
  });

  test('given curated topic linked to bucket, when bucket is deleted, then parent link is cascaded', async () => {
    const db = createMigratedTestDb();

    await insertBucketTopic(db, {
      id: 'topic-tech',
      slug: 'tech',
      name: 'Tech',
    });
    await db.insert(topics).values({
      id: 'topic-ai',
      slug: 'ai-regulation-2026',
      name: 'AI Regulation 2026',
      kind: 'curated',
    });
    await db.insert(topicParents).values({
      topicId: 'topic-ai',
      parentTopicId: 'topic-tech',
    });

    await db.delete(topics).where(eq(topics.id, 'topic-tech'));

    const links = await db.select().from(topicParents);
    expect(links).toEqual([]);
  });

  test('given prediction linked to topic, when prediction is deleted, then junction row is cascaded', async () => {
    const db = createMigratedTestDb();
    await insertBucketTopic(db, {
      id: 'topic-tech',
      slug: 'tech',
      name: 'Tech',
    });
    await insertSource(db, {
      id: 'source-jane',
      slug: 'jane-analyst',
      displayName: 'Jane Analyst',
    });
    await insertPrediction(db, {
      id: 'pred-1',
      sourceId: 'source-jane',
      text: 'test prediction',
      topicId: 'topic-tech',
    });
    await db.delete(predictions).where(eq(predictions.id, 'pred-1'));

    const links = await db.select().from(predictionTopics);
    expect(links).toEqual([]);
  });
});
