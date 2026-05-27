import type { Prediction } from '@/types/prediction';
import { getTopicBySlug, getTopicsByIds } from '@/lib/topic-store';

/**
 * Match predictions for a topic slug.
 * Curated topics: direct topicIds link.
 * Bucket topics: direct link or linked curated topic rolls up under this bucket.
 */
export function predictionMatchesTopicSlug(
  p: Prediction,
  topicSlug: string,
): boolean {
  const topic = getTopicBySlug(topicSlug);
  if (!topic) return false;

  if (p.topicIds.includes(topic.id)) return true;

  if (topic.kind === 'curated') return false;

  const linked = getTopicsByIds(p.topicIds);
  return linked.some(
    t => t.kind === 'curated' && t.parentTopicIds.includes(topic.id),
  );
}
