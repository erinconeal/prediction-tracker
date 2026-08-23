/**
 * Top-level app routes that must not be used as topic slugs.
 * Update when adding a new `app/<segment>/page.tsx` route.
 */
export const RESERVED_ROOT_SEGMENTS = new Set([
  'about',
  'api',
  'leaderboard',
  'predictions',
  'source',
  'staff',
  'topics',
]);

export function isReservedTopicSlug(slug: string): boolean {
  return RESERVED_ROOT_SEGMENTS.has(slug.trim().toLowerCase());
}

/** Public path for a topic feed page (bucket or curated). */
export function topicPagePath(slug: string): string {
  const norm = slug.trim().toLowerCase();
  if (!norm || isReservedTopicSlug(norm)) {
    throw new Error(`Invalid topic slug: ${slug}`);
  }
  return `/${norm}`;
}
