import {
  BUCKET_TOPICS,
  bucketNameFromSlug,
  bucketSlugFromName,
  type BucketTopicName,
} from '@/lib/topic-buckets';

export const TOPIC_BUCKET_TAB_VALUES = [
  'All',
  ...BUCKET_TOPICS.map(b => b.name),
] as const;

export type TopicBucketTab = (typeof TOPIC_BUCKET_TAB_VALUES)[number];

export function topicSlugFromBucketTab(
  tab: TopicBucketTab,
): string | undefined {
  if (tab === 'All') return undefined;
  return bucketSlugFromName(tab) ?? undefined;
}

export function topicBucketTabFromSlug(
  slug: string | null | undefined,
): TopicBucketTab | undefined {
  if (slug === null || slug === undefined || slug.trim() === '') {
    return undefined;
  }
  const name = bucketNameFromSlug(slug);
  return name ?? undefined;
}

export type { BucketTopicName };
