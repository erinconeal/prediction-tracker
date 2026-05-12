import { NextResponse } from "next/server";
import {
  getPredictionById,
  updatePredictionOutcome as patchRow,
} from "@/lib/prediction-store";
import { isTerminalOutcomeValue } from "@/types/prediction";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const row = getPredictionById(id);
  if (!row) {
    return NextResponse.json({ message: "Prediction not found" }, { status: 404 });
  }
  return NextResponse.json(row);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ message: "Expected object body" }, { status: 400 });
  }
  const outcome = (body as { outcome?: unknown }).outcome;
  if (!isTerminalOutcomeValue(outcome)) {
    return NextResponse.json(
      {
        message:
          '`outcome` must be one of: "correct", "incorrect", "unresolved", "invalid"',
      },
      { status: 400 },
    );
  }
  const updated = patchRow(id, outcome);
  if (!updated) {
    return NextResponse.json({ message: "Prediction not found" }, { status: 404 });
  }
  return NextResponse.json(updated);
}
