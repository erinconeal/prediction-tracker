export type Outcome = "pending" | "correct" | "incorrect";

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
