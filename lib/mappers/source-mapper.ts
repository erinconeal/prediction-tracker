import { slugify } from '@/utils/slugify';

export function toSourceInsert(displayName: string) {
  const trimmed = displayName.trim();
  return {
    id: `source-${slugify(trimmed)}`,
    slug: slugify(trimmed),
    displayName: trimmed,
    profileUrl: null,
    active: true,
  };
}
