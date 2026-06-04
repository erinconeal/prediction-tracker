import {
  TIMELINE_FINISHED_LABEL,
  TIMELINE_SUBMITTED_LABEL,
} from '@/lib/lifecycle-copy';
import { isStillOpenOutcome } from '@/lib/prediction-outcome';
import type { Prediction } from '@/types/prediction';

function isValidIsoDate(iso: string): boolean {
  return !Number.isNaN(new Date(iso).getTime());
}

export type SourceFeedCardDateDisplay = {
  label: string;
  iso: string;
};

type SourceFeedCardDateInput = Pick<
  Prediction,
  'outcome' | 'created_at' | 'finished_at'
>;

/** State-based date line for source prediction feed cards. */
export function sourceFeedCardDate(
  prediction: SourceFeedCardDateInput,
): SourceFeedCardDateDisplay | null {
  if (isStillOpenOutcome(prediction.outcome)) {
    if (!isValidIsoDate(prediction.created_at)) return null;

    return {
      label: TIMELINE_SUBMITTED_LABEL,
      iso: prediction.created_at,
    };
  }

  if (!prediction.finished_at || !isValidIsoDate(prediction.finished_at)) {
    return null;
  }

  return {
    label: TIMELINE_FINISHED_LABEL,
    iso: prediction.finished_at,
  };
}
