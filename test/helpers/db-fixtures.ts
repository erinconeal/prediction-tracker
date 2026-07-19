import type { AppDb } from '@/lib/db';
import {
  predictions,
  predictionTopics,
  sources,
  topicParents,
  topics,
} from '@/lib/schema';

export async function insertBucketTopic(
  db: AppDb,
  { id, slug, name }: { id: string; slug: string; name: string },
) {
  await db.insert(topics).values({ id, slug, name, kind: 'bucket' });
};

export async function insertCuratedTopic(
  db: AppDb,
  {
    id,
    slug,
    name,
    parentIds,
  }: { id: string; slug: string; name: string; parentIds: string[] },
) {
  await db.insert(topics).values({ id, slug, name, kind: 'curated' });

  for (const parentId of parentIds) {
    await db.insert(topicParents).values({ topicId: id, parentTopicId: parentId });
  }
}

export async function insertSource(
  db: AppDb,
  { id, slug, displayName }: { id: string; slug: string; displayName: string },
) {
  await db.insert(sources).values({ id, slug, displayName, active: true });
}

export async function insertPrediction(
  db: AppDb,
  {
    id,
    sourceId,
    text,
    topicId,
  }: { id: string; sourceId: string; text: string; topicId: string },
) {
  await db.insert(predictions).values({
    id,
    sourceId,
    text,
    createdAt: '2026-01-01T00:00:00.000Z',
    outcome: 'still_open',
  });
  await db.insert(predictionTopics).values({
    predictionId: id,
    topicId,
  });
}
