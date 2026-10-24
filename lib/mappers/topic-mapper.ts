import { topics } from '@/lib/schema';
import type { Topic } from '@/types/topic';

type TopicRow = typeof topics.$inferSelect;

export function toTopic(row: TopicRow, parentTopicIds: string[]): Topic {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    kind: row.kind,
    parentTopicIds,
  };
};
