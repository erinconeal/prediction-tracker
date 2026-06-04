import { OUTCOME_STILL_OPEN_LABEL } from '@/lib/lifecycle-copy';

export type SourceFeedStatusFilter = 'all' | 'still_open';

export function sourceFeedEmptyMessage(
  statusFilter: SourceFeedStatusFilter,
): string {
  if (statusFilter === 'still_open') {
    return `No ${OUTCOME_STILL_OPEN_LABEL.toLowerCase()} forecasts for this source.`;
  }
  return 'No forecasts recorded for this source yet.';
}
