export type TopicKind = 'bucket' | 'curated';

export type Topic = {
  id: string;
  slug: string;
  name: string;
  kind: TopicKind;
  /** Bucket topic IDs this curated topic rolls up under. */
  parentTopicIds: string[];
};
