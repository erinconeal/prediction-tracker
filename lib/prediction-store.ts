import type {
  CreatePredictionInput,
  Outcome,
  Prediction,
} from "@/types/prediction";
import { slugify } from "@/utils/slugify";

export type ListPredictionsFilter = {
  source?: string;
  status?: Outcome;
  /** Case-insensitive exact match on `category`. */
  category?: string;
  limit?: number;
  offset?: number;
};

const predictions: Prediction[] = [];

function seed(): void {
  if (predictions.length > 0) return;
  const now = new Date();
  const iso = (d: Date) => d.toISOString();
  const samples: CreatePredictionInput[] = [
    {
      source: "Jane Analyst",
      text: "Inflation will stay above 2% through Q4.",
      category: "Economics",
      target_date: "2026-12-31",
    },
    {
      source: "Tech Blogger",
      text: "Vendor X ships the new chip before June.",
      category: "Tech",
      target_date: "2026-06-01",
    },
    {
      source: "Jane Analyst",
      text: "Unemployment dips below 4% this year.",
      category: "Economics",
    },
    {
      source: "Jane Analyst",
      text: "The Fed cuts rates at least twice before year-end.",
      category: "Economics",
    },
  ];
  samples.forEach((input, i) => {
    predictions.push(
      createInternal(input, iso(new Date(now.getTime() + i))),
    );
  });
  predictions[0]!.outcome = "correct";
  predictions[1]!.outcome = "incorrect";
  predictions[2]!.outcome = "correct";
}

function createInternal(
  input: CreatePredictionInput,
  createdAtIso: string,
): Prediction {
  const sourceSlug = slugify(input.source);
  return {
    id: crypto.randomUUID(),
    source: input.source.trim(),
    sourceSlug,
    text: input.text.trim(),
    category: input.category?.trim() ? input.category.trim() : null,
    created_at: createdAtIso,
    target_date: input.target_date?.trim()
      ? normalizeTargetDate(input.target_date.trim())
      : null,
    outcome: "pending",
  };
}

function normalizeTargetDate(value: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00.000Z`).toISOString();
  }
  return new Date(value).toISOString();
}

function matchesSource(p: Prediction, source: string): boolean {
  const s = source.trim().toLowerCase();
  return (
    p.source.toLowerCase() === s ||
    p.sourceSlug === s ||
    p.sourceSlug === slugify(source)
  );
}

function matchesCategory(p: Prediction, category: string): boolean {
  const c = category.trim().toLowerCase();
  if (!c) return true;
  return p.category !== null && p.category.toLowerCase() === c;
}

/** Newest first; same `created_at` breaks ties with `id` (stable, deterministic). */
export function comparePredictionsNewestFirst(
  a: Prediction,
  b: Prediction,
): number {
  const t =
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  if (t !== 0) return t;
  return b.id.localeCompare(a.id);
}

/**
 * Filtered and sorted (newest `created_at` first) view of the store, without pagination.
 * Used by listPredictions and by leaderboard aggregation.
 */
export function filterAndSortPredictions(
  filter: Pick<ListPredictionsFilter, "source" | "status" | "category"> = {},
): Prediction[] {
  seed();
  const filtered = predictions.filter((p) => {
    if (filter.source && !matchesSource(p, filter.source)) return false;
    if (filter.status && p.outcome !== filter.status) return false;
    if (filter.category && !matchesCategory(p, filter.category)) return false;
    return true;
  });
  return filtered.sort(comparePredictionsNewestFirst);
}

/**
 * Read path for the in-memory store: filter, sort by `created_at` desc, then slice
 * for pagination (`limit` default 50 max 100, `offset` default 0).
 */
export function listPredictions(filter: ListPredictionsFilter = {}): Prediction[] {
  const { limit: rawLimit, offset: rawOffset, ...rest } = filter;
  const all = filterAndSortPredictions(rest);
  const limit = Math.min(Math.max(1, rawLimit ?? 50), 100);
  const offset = Math.max(0, rawOffset ?? 0);
  return all.slice(offset, offset + limit);
}

export function getPredictionById(id: string): Prediction | null {
  seed();
  return predictions.find((p) => p.id === id) ?? null;
}

export function createPrediction(input: CreatePredictionInput): Prediction {
  seed();
  const row = createInternal(input, new Date().toISOString());
  predictions.push(row);
  return row;
}

export function updatePredictionOutcome(
  id: string,
  outcome: Exclude<Outcome, "pending">,
): Prediction | null {
  seed();
  const row = predictions.find((p) => p.id === id);
  if (!row) return null;
  row.outcome = outcome;
  return row;
}
