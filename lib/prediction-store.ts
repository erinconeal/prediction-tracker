import type {
  CreatePredictionInput,
  Outcome,
  Prediction,
} from "@/types/prediction";
import { slugify } from "@/utils/slugify";

type ListFilter = {
  source?: string;
  status?: Outcome;
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
  ];
  for (const input of samples) {
    predictions.push(createInternal(input, iso(now)));
  }
  predictions[0]!.outcome = "correct";
  predictions[1]!.outcome = "incorrect";
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

/**
 * Read path for the in-memory store: ensures demo data exists on first use, then
 * returns rows matching optional source (display name or slug) and outcome.
 * Used by GET /api/predictions so filtering stays server-side and consistent with the API.
 */
export function listPredictions(filter: ListFilter = {}): Prediction[] {
  seed();
  return predictions.filter((p) => {
    if (filter.source && !matchesSource(p, filter.source)) return false;
    if (filter.status && p.outcome !== filter.status) return false;
    return true;
  });
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
