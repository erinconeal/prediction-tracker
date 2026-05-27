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
