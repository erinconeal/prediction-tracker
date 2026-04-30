/** Runtime list of outcome values; `Outcome` is derived so the type stays in sync. */
export const OUTCOMES = ["pending", "correct", "incorrect"] as const;

export type Outcome = (typeof OUTCOMES)[number];

export type Prediction = {
  id: string;
  source: string;
  sourceSlug: string;
  text: string;
  category: string | null;
  created_at: string;
  target_date: string | null;
  outcome: Outcome;
};

export type PredictionFilters = {
  /** Matches `source` display name or `sourceSlug` (e.g. URL segment). */
  source?: string;
  status?: Outcome | "all";
  /** Case-insensitive exact match on stored `category`; omit for all topics. */
  category?: string;
  /** Page size for list API (default 50, max 100). */
  limit?: number;
  /** Offset into sorted filtered results (default 0). */
  offset?: number;
};

export type CreatePredictionInput = {
  source: string;
  text: string;
  category?: string;
  /** ISO date string (YYYY-MM-DD) or full ISO datetime */
  target_date?: string;
};

export type UpdatePredictionOutcomeInput = {
  outcome: Exclude<Outcome, "pending">;
};
