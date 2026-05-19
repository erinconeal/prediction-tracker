/**
 * Lifecycle storage values aligned with `constitution.md` §5–§6:
 * `pending` = pre-resolution; `correct`/`incorrect`/`unresolved`/`invalid` = terminal outcomes.
 */
export const OUTCOMES = [
  "pending",
  "correct",
  "incorrect",
  "unresolved",
  "invalid",
] as const;

export type Outcome = (typeof OUTCOMES)[number];

/** Terminal outcomes (PATCH body); excludes `pending`. */
export type TerminalOutcome = Exclude<Outcome, "pending">;

const TERMINAL_SET = new Set<string>([
  "correct",
  "incorrect",
  "unresolved",
  "invalid",
]);

export function isTerminalOutcomeValue(
  value: unknown,
): value is TerminalOutcome {
  return typeof value === "string" && TERMINAL_SET.has(value);
}

export type Prediction = {
  id: string;
  source: string;
  sourceSlug: string;
  text: string;
  category: string | null;
  /** Linked curated topics (many-to-many). */
  topicIds: string[];
  created_at: string;
  /** Set when a terminal outcome is assigned; `null` while `pending`. */
  resolved_at: string | null;
  target_date: string | null;
  outcome: Outcome;
};

/** List ordering for `/api/predictions`; default is `newest`. */
export type PredictionListSort =
  | "newest"
  | "source_accuracy"
  | "recently_resolved";

export type PredictionFilters = {
  /** Matches `source` display name or `sourceSlug` (e.g. URL segment). */
  source?: string;
  status?: Outcome | "all";
  /** Case-insensitive match on `category` or linked topic categories; omit for all. */
  category?: string;
  /** Filter by topic slug (exact match). */
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
  category?: string;
  topicIds?: string[];
  /** ISO date string (YYYY-MM-DD) or full ISO datetime */
  target_date?: string;
};

export type UpdatePredictionOutcomeInput = {
  outcome: TerminalOutcome;
};
