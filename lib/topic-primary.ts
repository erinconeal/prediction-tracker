import type { Topic } from '@/types/topic';

export function pickPrimaryTopicFromLinked(linked: Topic[]): Topic | null {
  if (linked.length === 0) return null;
  const curated = linked.find(t => t.kind === 'curated');
  if (curated) return curated;
  const bucket = linked.find(t => t.kind === 'bucket');
  if (bucket) return bucket;
  return linked[0] ?? null;
}

/** Bucket topic shown before the primary curated label on cards (linked bucket, else first parent). */
export function pickDisplayBucketTopic(
  linked: Topic[],
  primary: Topic | null,
  parentBuckets: Topic[],
): Topic | null {
  if (!primary || primary.kind !== 'curated') return null;
  const linkedBucket = linked.find(t => t.kind === 'bucket');
  if (linkedBucket) return linkedBucket;
  return parentBuckets[0] ?? null;
}

export function pickPrimaryBucketFromLinked(
  linked: Topic[],
  topicById: ReadonlyMap<string, Topic>,
): Topic | null {
  for (const t of linked) {
    if (t.kind === 'bucket') return t;
  }
  for (const t of linked) {
    if (t.kind === 'curated' && t.parentTopicIds.length > 0) {
      const parent = topicById.get(t.parentTopicIds[0]!);
      if (parent?.kind === 'bucket') return parent;
    }
  }
  return null;
}
