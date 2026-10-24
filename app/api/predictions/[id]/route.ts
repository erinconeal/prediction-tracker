import { NextResponse } from 'next/server';

import { assertStaffSecret } from '@/lib/assert-staff-secret';
import { loadPredictionById, patchPredictionOutcome } from '@/lib/repositories/prediction-repository';
import { isTerminalOutcomeValue } from '@/types/prediction';

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
  const rawUrl = (body as { resolutionUrl?: unknown }).resolutionUrl;
  if (rawUrl !== undefined && rawUrl !== null && typeof rawUrl !== 'string') {
    return NextResponse.json({ message: '`resolutionUrl` must be null or a string' }, { status: 400 });
  }
  const resolutionUrl = typeof rawUrl === 'string' ? rawUrl : null;
  const result = await patchPredictionOutcome(id, outcome, resolutionUrl);
  if (!result.ok) {
    if (result.reason === 'not_found') {
      return NextResponse.json({ message: 'Prediction not found' }, { status: 404 });
    }
    return NextResponse.json({ message: result.reason }, { status: 409 });
  }
  return NextResponse.json(result.prediction);
}
