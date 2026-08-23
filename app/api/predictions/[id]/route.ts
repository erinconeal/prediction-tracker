import { NextResponse } from 'next/server';
import { loadPredictionById, patchPredictionOutcome } from '@/lib/repositories/prediction-repository';
import { isTerminalOutcomeValue } from '@/types/prediction';
import { assertStaffSecret } from '@/lib/assert-staff-secret';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const row = await loadPredictionById(id);
  if (!row) {
    return NextResponse.json({ message: 'Prediction not found' }, { status: 404 });
  }
  return NextResponse.json(row);
}

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;
  let body: unknown;
  try {
    const unauthorized = assertStaffSecret(request);
    if (unauthorized) return unauthorized;
    body = await request.json();
  }
  catch {
    return NextResponse.json({ message: 'Invalid JSON body' }, { status: 400 });
  }
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ message: 'Expected object body' }, { status: 400 });
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
  const updated = await patchPredictionOutcome(id, outcome);
  if (!updated) {
    return NextResponse.json({ message: 'Prediction not found' }, { status: 404 });
  }
  return NextResponse.json(updated);
}
