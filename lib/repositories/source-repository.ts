import { eq, or } from 'drizzle-orm';
import { getDb } from '@/lib/db';
import { toSourceInsert } from '@/lib/mappers/source-mapper';
import { sources } from '@/lib/schema';
import { slugify } from '@/utils/slugify';

export async function findSourceByDisplayNameOrSlug(name: string) {
  const trimmed = name.trim();
  const slug = slugify(trimmed);

  return getDb().query.sources.findFirst({
    where: or(
      eq(sources.slug, slug),
      eq(sources.displayName, trimmed),
    ),
  });
};

/** Get existing source or insert a new allowlist row. */
export async function findOrCreateSource(displayName: string) {
  const existing = await findSourceByDisplayNameOrSlug(displayName);
  if (existing) return existing;

  const insert = toSourceInsert(displayName);
  await getDb().insert(sources).values(insert);
  return insert;
};
