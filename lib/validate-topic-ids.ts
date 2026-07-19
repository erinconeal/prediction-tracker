import { getTopicsByIds } from '@/lib/repositories/topic-repository';

/** Topic IDs that are not present in the topic catalog. */
export async function findUnknownTopicIds(ids: string[]): Promise<string[]> {
  const unique = [...new Set(ids)];
  if (unique.length === 0) return [];

  const found = await getTopicsByIds(unique);
  const known = new Set(found.map(t => t.id));
  return unique.filter(id => !known.has(id));
}
