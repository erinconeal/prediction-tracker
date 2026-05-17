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
