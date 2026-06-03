/**
 * Lifecycle storage values aligned with `constitution.md` §5–§6:
 * `still_open` = pre-resolution; `correct`/`incorrect`/`unresolved`/`invalid` = terminal outcomes.
 */
import { isTerminalOutcome } from '@/lib/prediction-outcome';

export const OUTCOMES = [
  'still_open',
  'correct',
  'incorrect',
  'unresolved',
  'invalid',
] as const;

export type Outcome = (typeof OUTCOMES)[number];

/** Terminal outcomes (PATCH body); excludes `still_open`. */
export type TerminalOutcome = Exclude<Outcome, 'still_open'>;

export function isTerminalOutcomeValue(
  value: unknown,
): value is TerminalOutcome {
  return (
    typeof value === 'string'
    && (OUTCOMES as readonly string[]).includes(value)
    && isTerminalOutcome(value as Outcome)
  );
}

export type Prediction = {
  id: string;
  source: string;
  sourceSlug: string;
  text: string;
  /** Linked topics (many-to-many). */
  topicIds: string[];
  created_at: string;
  /** Set when a terminal outcome is assigned; `null` while `still_open`. */
  finished_at: string | null;
  target_date: string | null;
  outcome: Outcome;
};

/** List ordering for `/api/predictions`; default is `newest`. */
export type PredictionListSort
  = | 'newest'
    | 'source_accuracy'
    | 'recently_finished';

export type PredictionFilters = {
  /** Matches `source` display name or `sourceSlug` (e.g. URL segment). */
  source?: string;
  status?: Outcome | 'all';
  /** Filter by topic slug (bucket roll-up or exact curated match). */
  topic?: string;
  /** Page size for list API (default 50, max 100). */
  limit?: number;
  /** Offset into sorted filtered results (default 0). */
  offset?: number;
  sort?: PredictionListSort;
};

export type CreatePredictionInput = {
  source: string;
  text: string;
  topicIds?: string[];
  /** ISO date string (YYYY-MM-DD) or full ISO datetime */
  target_date?: string;
};

export type UpdatePredictionOutcomeInput = {
  outcome: TerminalOutcome;
};
