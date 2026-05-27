import type { Prediction } from '@/types/prediction';
import type { Topic } from '@/types/topic';

/** How far back a prediction counts as "recent" for trending rank. */
export const TRENDING_RECENCY_MS = 14 * 24 * 60 * 60 * 1000;

export type TrendingTopicEntry = {
  topic: Topic;
  count: number;
  recentCount: number;
};

/**
 * Ranks curated topics by linked prediction volume and recency.
 * Pass curated topics only (buckets excluded from the pool).
 */
export function rankTrendingTopics(
  topics: Topic[],
  predictions: Prediction[],
  options?: { now?: number; recencyMs?: number; limit?: number },
): TrendingTopicEntry[] {
  const now = options?.now ?? Date.now();
  const recencyMs = options?.recencyMs ?? TRENDING_RECENCY_MS;
  const limit = options?.limit ?? 6;

  const curatedPool = topics.filter(t => t.kind === 'curated');
  const topicById = new Map(curatedPool.map(t => [t.id, t]));
  const buckets = new Map<
    string,
    { topic: Topic; count: number; recentCount: number }
  >();

  for (const p of predictions) {
    const seen = new Set<string>();
    for (const topicId of p.topicIds) {
      if (seen.has(topicId)) continue;
      seen.add(topicId);
      const topic = topicById.get(topicId);
      if (!topic) continue;

      const cur = buckets.get(topicId) ?? {
        topic,
        count: 0,
        recentCount: 0,
      };
      cur.count += 1;
      const created = Date.parse(p.created_at);
      if (!Number.isNaN(created) && now - created <= recencyMs) {
        cur.recentCount += 1;
      }
      buckets.set(topicId, cur);
    }
  }

  return [...buckets.values()]
    .sort((a, b) => {
      if (b.recentCount !== a.recentCount) {
        return b.recentCount - a.recentCount;
      }
      return b.count - a.count;
    })
    .slice(0, limit);
}
