import { pickDisplayBucketTopic, pickPrimaryTopicFromLinked } from '@/lib/topic-primary';
import type { Topic } from '@/types/topic';

export type ResolvedPredictionTopics = {
  topics: Topic[];
  primary: Topic | null;
  bucketParent: Topic | null;
  extraTopics: Topic[];
};

/**
 * Resolve primary / bucket / extra topics from an in-memory catalog in one pass.
 */
export function resolvePredictionTopics(
  topicIds: string[],
  catalog: readonly Topic[],
): ResolvedPredictionTopics {
  if (topicIds.length === 0) {
    return {
      topics: [],
      primary: null,
      bucketParent: null,
      extraTopics: [],
    };
  }

  const byId = new Map(catalog.map(t => [t.id, t]));
  const seen = new Set<string>();
  const topics: Topic[] = [];
  for (const id of topicIds) {
    if (seen.has(id)) continue;
    seen.add(id);
    const topic = byId.get(id);
    if (topic) topics.push(topic);
  }

  const primary = pickPrimaryTopicFromLinked(topics);
  const parentBuckets = primary?.kind === 'curated'
    ? primary.parentTopicIds
        .map(id => byId.get(id))
        .filter((t): t is Topic => t !== undefined && t.kind === 'bucket')
    : [];
  const bucketParent = primary
    ? pickDisplayBucketTopic(topics, primary, parentBuckets)
    : null;
  const extraTopics = topics.filter(
    t => t.id !== primary?.id && t.id !== bucketParent?.id,
  );

  return { topics, primary, bucketParent, extraTopics };
}
