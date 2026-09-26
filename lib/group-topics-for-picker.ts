import type { Topic } from '@/types/topic';

export type TopicPickerGroup = {
  /** Bucket this group rolls up under. Null when a curated topic has no parent in the catalog. */
  parent: Topic | null;
  children: Topic[];
};

function byName(a: Topic, b: Topic): number {
  return a.name.localeCompare(b.name);
}

function nameMatches(topic: Topic, needle: string): boolean {
  return topic.name.toLowerCase().includes(needle);
}

/**
 * Groups curated topics under each parent bucket for the staff topic picker.
 * A curated topic with several parents appears under each of those parents.
 * An empty query returns every topic. A query keeps a matching child under its
 * parent, and a matching parent keeps all of its children.
 */
export function groupTopicsForPicker(topics: Topic[], query: string): TopicPickerGroup[] {
  const needle = query.trim().toLowerCase();
  const buckets = topics.filter(topic => topic.kind === 'bucket').sort(byName);
  const bucketIds = new Set(buckets.map(topic => topic.id));
  const curated = topics.filter(topic => topic.kind === 'curated');

  const groups = buckets.flatMap((parent): TopicPickerGroup[] => {
    const children = curated
      .filter(topic => topic.parentTopicIds.includes(parent.id))
      .sort(byName);
    if (needle.length === 0 || nameMatches(parent, needle)) return [{ parent, children }];
    const matchingChildren = children.filter(topic => nameMatches(topic, needle));
    if (matchingChildren.length === 0) return [];
    return [{ parent, children: matchingChildren }];
  });

  const orphans = curated
    .filter(topic => topic.parentTopicIds.every(id => !bucketIds.has(id)))
    .filter(topic => needle.length === 0 || nameMatches(topic, needle))
    .sort(byName);

  if (orphans.length === 0) return groups;
  return [...groups, { parent: null, children: orphans }];
}
