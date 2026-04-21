/**
 * Normalizes a display string into a URL-safe slug. Collisions are possible for
 * distinct names that normalize the same way (MVP tradeoff).
 */
export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
