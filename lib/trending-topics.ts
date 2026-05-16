import { TOPIC_TAB_VALUES, type TopicTab } from "@/lib/topic-tabs";
import type { Prediction } from "@/types/prediction";

/** How far back a prediction counts as "recent" for trending rank. */
export const TRENDING_RECENCY_MS = 14 * 24 * 60 * 60 * 1000;

export type TrendingTopic = {
  topic: TopicTab;
  count: number;
  recentCount: number;
};

const KNOWN_TOPICS = TOPIC_TAB_VALUES.filter(
  (tab): tab is Exclude<TopicTab, "All"> => tab !== "All",
);

export function topicTabFromCategory(
  category: string | null,
): Exclude<TopicTab, "All"> | null {
  if (category === null || category.trim() === "") return null;
  const norm = category.trim().toLowerCase();
  for (const tab of KNOWN_TOPICS) {
    if (tab.toLowerCase() === norm) return tab;
  }
  return null;
}

/**
 * Ranks known topic tabs by recent activity, then total volume.
 * Only categories that match {@link TOPIC_TAB_VALUES} are included.
 */
export function rankTrendingTopics(
  predictions: Prediction[],
  options?: { now?: number; recencyMs?: number; limit?: number },
): TrendingTopic[] {
  const now = options?.now ?? Date.now();
  const recencyMs = options?.recencyMs ?? TRENDING_RECENCY_MS;
  const limit = options?.limit ?? 6;

  const buckets = new Map<
    Exclude<TopicTab, "All">,
    { count: number; recentCount: number }
  >();

  for (const p of predictions) {
    const topic = topicTabFromCategory(p.category);
    if (topic === null) continue;

    const cur = buckets.get(topic) ?? { count: 0, recentCount: 0 };
    cur.count += 1;
    const created = Date.parse(p.created_at);
    if (!Number.isNaN(created) && now - created <= recencyMs) {
      cur.recentCount += 1;
    }
    buckets.set(topic, cur);
  }

  return [...buckets.entries()]
    .map(([topic, stats]) => ({ topic, ...stats }))
    .sort((a, b) => {
      if (b.recentCount !== a.recentCount) {
        return b.recentCount - a.recentCount;
      }
      return b.count - a.count;
    })
    .slice(0, limit);
}
