/** User-facing lifecycle terminology (see /about#lifecycle-language). */

export const OUTCOME_STILL_OPEN_LABEL = 'Still open';

export function formatStillOpenCount(count: number): string {
  return `${count} still open`;
}

export const STAT_NO_LONGER_OPEN = 'No longer open';

export const STAT_NO_LONGER_OPEN_HINT
  = 'Forecasts with a final outcome: correct, incorrect, unresolved, or invalid. Still-open forecasts are not included.';

export const STAT_STILL_OPEN_HINT
  = 'No final outcome has been recorded yet.';

export const SORT_RECENTLY_FINISHED = 'Recently finished';

export const SORT_RECENTLY_FINISHED_HINT
  = 'Finished forecasts first (by when the outcome was recorded), then still-open forecasts. Includes all final outcomes, not only correct or incorrect.';

export const WIDGET_RECENTLY_JUDGED = 'Recently judged correct/incorrect';

export const WIDGET_RECENTLY_JUDGED_HINT
  = 'Latest forecasts marked correct or incorrect only. Excludes still-open, unresolved, and invalid forecasts.';

export const WIDGET_RECENTLY_JUDGED_EMPTY
  = 'No correct or incorrect forecasts yet.';

export const LIFECYCLE_GLOSSARY_ANCHOR = 'lifecycle-language';

export const LIFECYCLE_GLOSSARY_HEADING = 'How we describe forecast status';

export const TIMELINE_FINISHED_LABEL = 'Finished';

export type LifecycleGlossaryEntry = {
  term: string;
  meaning: string;
};

export const LIFECYCLE_GLOSSARY_ENTRIES: LifecycleGlossaryEntry[] = [
  {
    term: 'Still open',
    meaning:
      'No final outcome has been recorded yet.',
  },
  {
    term: 'No longer open',
    meaning:
      'A final outcome was recorded (correct, incorrect, unresolved, or invalid).',
  },
  {
    term: 'Correct / Incorrect',
    meaning:
      'Scored outcomes used in accuracy percentages (constitution section 7.2).',
  },
  {
    term: 'Unresolved / Invalid',
    meaning:
      'Final outcomes that are not scored: could not be determined with confidence, or failed inclusion criteria (sections 6.3 and 7.3).',
  },
  {
    term: 'Dates on forecast cards',
    meaning:
      'Browse and timeline cards show outcome with the badge only. Target dates, finish dates, and when a forecast was added appear on the prediction detail page.',
  },
  {
    term: 'Recently judged correct/incorrect',
    meaning:
      'Sidebar list of the latest forecasts marked correct or incorrect only.',
  },
];
