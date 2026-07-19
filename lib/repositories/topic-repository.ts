import { eq, inArray } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { toTopic } from '@/lib/mappers/topic-mapper';
import { topicParents, topics } from '@/lib/schema';
import type { Topic } from '@/types/topic';

async function loadParentIdsByTopicId(topicIds: string[]): Promise<Map<string, string[]>> {
  if (topicIds.length === 0) return new Map();

  const links = await getDb()
    .select()
    .from(topicParents)
    .where(inArray(topicParents.topicId, topicIds));

  const map = new Map<string, string[]>();
  for (const link of links) {
    const list = map.get(link.topicId) ?? [];
    list.push(link.parentTopicId);
    map.set(link.topicId, list);
  }

  return map;
};

async function rowsToTopics(rows: typeof topics.$inferSelect[]): Promise<Topic[]> {
  const parentMap = await loadParentIdsByTopicId(rows.map(r => r.id));
  return rows.map(r => toTopic(r, parentMap.get(r.id) ?? []));
};

export async function listTopics(): Promise<Topic[]> {
  const rows = await getDb().select().from(topics);
  return rowsToTopics(rows);
};

export async function getTopicBySlug(slug: string): Promise<Topic | null> {
  const row = await getDb().query.topics.findFirst({
    where: eq(topics.slug, slug.trim().toLowerCase()),
  });
  if (!row) return null;
  const [topic] = await rowsToTopics([row]);
  return topic;
};

export async function getTopicById(id: string): Promise<Topic | null> {
  const row = await getDb().query.topics.findFirst({
    where: eq(topics.id, id),
  });
  if (!row) return null;
  const [topic] = await rowsToTopics([row]);
  return topic;
};

export async function getTopicsByIds(ids: string[]): Promise<Topic[]> {
  if (ids.length === 0) return [];
  const rows = await getDb()
    .select()
    .from(topics)
    .where(inArray(topics.id, [...new Set(ids)]));
  return rowsToTopics(rows);
};

export async function listCuratedTopics(): Promise<Topic[]> {
  const rows = await getDb()
    .select()
    .from(topics)
    .where(eq(topics.kind, 'curated'));
  return rowsToTopics(rows);
}

export async function listBucketTopics(): Promise<Topic[]> {
  const rows = await getDb()
    .select()
    .from(topics)
    .where(eq(topics.kind, 'bucket'));
  return rowsToTopics(rows);
}

export async function listTopicsForBucket(bucketSlug: string): Promise<Topic[]> {
  const bucket = await getTopicBySlug(bucketSlug);
  if (!bucket || bucket.kind !== 'bucket') return [];

  const links = await getDb()
    .select()
    .from(topicParents)
    .where(eq(topicParents.parentTopicId, bucket.id));

  const childIds = links.map(l => l.topicId);
  return getTopicsByIds(childIds);
};
