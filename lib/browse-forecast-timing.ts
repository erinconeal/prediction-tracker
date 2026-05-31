import { isScoredOutcome, isTerminalOutcome } from '@/lib/prediction-outcome';
import type { Prediction } from '@/types/prediction';
import { formatIsoDate, formatMonthYear } from '@/utils/format-date';

export type BrowseForecastTimingInput = Pick<
  Prediction,
  'outcome' | 'resolved_at' | 'target_date' | 'created_at'
>;

export type BrowseForecastTiming = {
  prefix: 'Resolved' | 'Closed' | 'Target' | 'Added';
  dateTime: string;
  dateLabel: string;
};

/** Muted timing line for browse forecast cards (Resolved / Closed / Target / Added). */
export function browseForecastTiming(
  p: BrowseForecastTimingInput,
): BrowseForecastTiming {
  if (isScoredOutcome(p.outcome) && p.resolved_at) {
    return {
      prefix: 'Resolved',
      dateTime: p.resolved_at,
      dateLabel: formatIsoDate(p.resolved_at),
    };
  }
  if (isTerminalOutcome(p.outcome) && p.resolved_at) {
    return {
      prefix: 'Closed',
      dateTime: p.resolved_at,
      dateLabel: formatIsoDate(p.resolved_at),
    };
  }
  // Pending rows ignore resolved_at (open lifecycle); fall through to Target / Added.
  if (p.target_date) {
    return {
      prefix: 'Target',
      dateTime: p.target_date,
      dateLabel: formatMonthYear(p.target_date),
    };
  }
  return {
    prefix: 'Added',
    dateTime: p.created_at,
    dateLabel: formatIsoDate(p.created_at),
  };
}

/** Full visible timing string (prefix + formatted date). */
export function browseForecastTimingLine(p: BrowseForecastTimingInput): string {
  const { prefix, dateLabel } = browseForecastTiming(p);
  return `${prefix} ${dateLabel}`;
}
