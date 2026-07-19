import type { Prediction } from '@/types/prediction';
import type { Topic } from '@/types/topic';
import { getTopicBySlug, getTopicsByIds } from '@/lib/repositories/topic-repository';

/**
 * Sync match using a preloaded topic map (avoids per-prediction DB lookups).
 * `topicById` should include every id in `p.topicIds` that exists in the catalog.
 */
export function predictionMatchesTopicWithCatalog(
  p: Prediction,
  topic: Topic,
  topicById: ReadonlyMap<string, Topic>,
): boolean {
  if (p.topicIds.includes(topic.id)) return true;
  if (topic.kind === 'curated') return false;

  return p.topicIds.some((id) => {
    const linked = topicById.get(id);
    return linked?.kind === 'curated' && linked.parentTopicIds.includes(topic.id);
  });
}

export async function predictionMatchesTopic(
  p: Prediction,
  topic: Topic,
): Promise<boolean> {
  if (p.topicIds.includes(topic.id)) return true;
  if (topic.kind === 'curated') return false;

  const linked = await getTopicsByIds(p.topicIds);
  return predictionMatchesTopicWithCatalog(
    p,
    topic,
    new Map(linked.map(t => [t.id, t])),
  );
}

/**
 * Match predictions for a topic slug.
 * Curated topics: direct topicIds link.
 * Bucket topics: direct link or linked curated topic rolls up under this bucket.
 */
export async function predictionMatchesTopicSlug(
  p: Prediction,
  topicSlug: string,
): Promise<boolean> {
  const topic = await getTopicBySlug(topicSlug);
  if (!topic) return false;

  return predictionMatchesTopic(p, topic);
}
