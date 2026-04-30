import { NextResponse } from "next/server";
import {
  createPrediction as createRow,
  listPredictions as listRows,
} from "@/lib/prediction-store";
import type { CreatePredictionInput, Outcome } from "@/types/prediction";

function parseQueryInt(value: string | null, fallback: number): number {
  if (value === null || value === "") return fallback;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * Lists predictions for the UI service layer. Query params mirror `PredictionFilters`:
 * unknown `status` values are ignored so the client cannot force invalid enum strings
 * into the store—only well-known outcomes are applied.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get("source") ?? undefined;
  const category = searchParams.get("category") ?? undefined;
  const statusParam = searchParams.get("status");
  let status: Outcome | undefined;
  if (
    statusParam === "pending" ||
    statusParam === "correct" ||
    statusParam === "incorrect"
  ) {
    status = statusParam;
  }
  const limit = parseQueryInt(searchParams.get("limit"), 50);
  const offset = Math.max(0, parseQueryInt(searchParams.get("offset"), 0));
  const data = listRows({
    source,
    status,
    category: category?.trim() ? category.trim() : undefined,
    limit,
    offset,
  });
  return NextResponse.json(data);
}

/**
 * Creates a prediction with server-owned fields (`id`, timestamps, `sourceSlug`,
 * default `outcome`). Validates input before the store so bad payloads never
 * allocate rows; responds with 201 and the full row for the client cache.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ message: "Expected object body" }, { status: 400 });
  }
  const b = body as Record<string, unknown>;
  const source = typeof b.source === "string" ? b.source : "";
  const text = typeof b.text === "string" ? b.text : "";
  if (!source.trim() || !text.trim()) {
    return NextResponse.json(
      { message: "`source` and `text` are required strings" },
      { status: 400 },
    );
  }
  const input: CreatePredictionInput = {
    source,
    text,
    category: typeof b.category === "string" ? b.category : undefined,
    target_date: typeof b.target_date === "string" ? b.target_date : undefined,
  };
  const created = createRow(input);
  return NextResponse.json(created, { status: 201 });
}
