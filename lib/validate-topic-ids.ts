import { getTopicById } from "@/lib/topic-store";

/** Topic IDs that are not in the curated topic catalog. */
export function findUnknownTopicIds(ids: string[]): string[] {
  const unique = [...new Set(ids)];
  return unique.filter((id) => getTopicById(id) === null);
}
