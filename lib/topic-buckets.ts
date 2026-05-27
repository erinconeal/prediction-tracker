/** Browse bucket topics (matches topic-store seed). */
export const BUCKET_TOPICS = [
  { slug: 'tech', name: 'Tech' },
  { slug: 'sports', name: 'Sports' },
  { slug: 'politics', name: 'Politics' },
  { slug: 'finance', name: 'Finance' },
  { slug: 'weather', name: 'Weather' },
  { slug: 'historical', name: 'Historical' },
] as const;

export type BucketTopicSlug = (typeof BUCKET_TOPICS)[number]['slug'];

export type BucketTopicName = (typeof BUCKET_TOPICS)[number]['name'];

const slugByName = new Map(
  BUCKET_TOPICS.map(b => [b.name.toLowerCase(), b.slug] as const),
);

const nameBySlug = new Map(BUCKET_TOPICS.map(b => [b.slug, b.name] as const));

export function bucketSlugFromName(name: string): BucketTopicSlug | null {
  const slug = slugByName.get(name.trim().toLowerCase());
  return slug ?? null;
}

export function bucketNameFromSlug(slug: string): BucketTopicName | null {
  const norm = slug.trim().toLowerCase();
  return nameBySlug.get(norm as BucketTopicSlug) ?? null;
}
