import { outcomeLabels } from '@/components/predictions/outcome-display';
import type { TopicBucketTab } from '@/lib/topic-tabs';
import type { Outcome } from '@/types/prediction';

export function browseEmptyMessage(
  topicTab: TopicBucketTab,
  outcomeFilter: Outcome | 'all',
): string {
  if (topicTab === 'All' && outcomeFilter === 'all') {
    return 'No predictions match these filters.';
  }
  if (outcomeFilter !== 'all' && topicTab !== 'All') {
    return `No ${outcomeLabels[outcomeFilter].toLowerCase()} forecasts in “${topicTab}” yet.`;
  }
  if (outcomeFilter !== 'all') {
    return `No ${outcomeLabels[outcomeFilter].toLowerCase()} forecasts in this view yet.`;
  }
  return `No predictions in “${topicTab}” yet.`;
}
