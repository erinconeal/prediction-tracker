/** Fixed category allowlist for browse rails and feed filters. */
export const CATEGORIES = [
  "Tech",
  "Sports",
  "Politics",
  "Finance",
  "Weather",
  "Historical",
] as const;

export type Category = (typeof CATEGORIES)[number];

const CATEGORY_SET = new Set<string>(CATEGORIES);

export function isCategory(value: string): value is Category {
  return CATEGORY_SET.has(value);
}

/** URL segment for `/category/[slug]` (lowercase). */
export function categoryToSlug(category: Category): string {
  return category.toLowerCase();
}

export function categoryFromSlug(slug: string): Category | null {
  const norm = slug.trim().toLowerCase();
  for (const c of CATEGORIES) {
    if (c.toLowerCase() === norm) return c;
  }
  return null;
}
