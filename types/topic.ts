export const TOPIC_KINDS = ['bucket', 'curated'] as const;
export type TopicKind = (typeof TOPIC_KINDS)[number];

export type Topic = {
  id: string;
  slug: string;
  name: string;
  kind: TopicKind;
  /** Bucket topic IDs this curated topic rolls up under. */
  parentTopicIds: string[];
};
