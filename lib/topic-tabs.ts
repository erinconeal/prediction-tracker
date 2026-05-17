/** Topic filters aligned with demo seed and common categories. */
export const TOPIC_TAB_VALUES = [
  "All",
  "Tech",
  "Sports",
  "Politics",
  "Finance",
] as const;

export type TopicTab = (typeof TOPIC_TAB_VALUES)[number];

export function categoryFromTopicTab(tab: TopicTab): string | undefined {
  return tab === "All" ? undefined : tab;
}

/** Maps a stored category string to a topic tab when it matches a known tab label. */
export function topicTabFromCategory(
  category: string | null | undefined,
): TopicTab | undefined {
  const raw = category?.trim();
  if (!raw) return undefined;
  const lower = raw.toLowerCase();
  for (const tab of TOPIC_TAB_VALUES) {
    if (tab === "All") continue;
    if (tab.toLowerCase() === lower) return tab;
  }
  return undefined;
}
