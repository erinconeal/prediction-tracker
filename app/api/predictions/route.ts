import { NextResponse } from 'next/server';
import { findUnknownTopicIds } from '@/lib/validate-topic-ids';
import {
  OUTCOMES,
  type CreatePredictionInput,
  type Outcome,
  type PredictionListSort,
} from '@/types/prediction';
import { loadAllPredictions, insertPrediction } from '@/lib/repositories/prediction-repository';
import { filterAndSortPredictions, paginatePredictions } from '@/lib/prediction-query';
import { assertStaffSecret } from '@/lib/assert-staff-secret';

function parseQueryInt(value: string | null, fallback: number): number {
  if (value === null || value === '') return fallback;
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
  const source = searchParams.get('source') ?? undefined;
  const topic = searchParams.get('topic') ?? undefined;
  const statusParam = searchParams.get('status');
  let status: Outcome | undefined;
  if (
    statusParam !== null
    && statusParam !== ''
    && (OUTCOMES as readonly string[]).includes(statusParam)
  ) {
    status = statusParam as Outcome;
  }
  const limit = parseQueryInt(searchParams.get('limit'), 50);
  const offset = Math.max(0, parseQueryInt(searchParams.get('offset'), 0));
  const sortParam = searchParams.get('sort');
  let sort: PredictionListSort | undefined;
  if (
    sortParam === 'newest'
    || sortParam === 'source_accuracy'
    || sortParam === 'recently_finished'
  ) {
    sort = sortParam;
  }
  const all = await loadAllPredictions();
  const filteredAndSorted = await filterAndSortPredictions(all, { source, status, topic, sort });
  const paginated = paginatePredictions(filteredAndSorted, { limit, offset });
  return NextResponse.json(paginated);
}

/**
 * Creates a prediction with server-owned fields (`id`, timestamps, `sourceSlug`,
 * default `outcome`). Validates input before the store so bad payloads never
 * allocate rows; responds with 201 and the full row for the client cache.
 */
export async function POST(request: Request) {
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
  const b = body as Record<string, unknown>;
  const source = typeof b.source === 'string' ? b.source : '';
  const text = typeof b.text === 'string' ? b.text : '';
  if (!source.trim() || !text.trim()) {
    return NextResponse.json(
      { message: '`source` and `text` are required strings' },
      { status: 400 },
    );
  }
  const topicIds = Array.isArray(b.topicIds)
    ? b.topicIds.filter((id): id is string => typeof id === 'string')
    : undefined;
  if (topicIds && topicIds.length > 0) {
    const unknown = await findUnknownTopicIds(topicIds);
    if (unknown.length > 0) {
      return NextResponse.json(
        { message: `Unknown topicIds: ${unknown.join(', ')}` },
        { status: 400 },
      );
    }
  }
  const input: CreatePredictionInput = {
    source,
    text,
    topicIds,
    target_date: typeof b.target_date === 'string' ? b.target_date : undefined,
  };
  const created = await insertPrediction(input);
  return NextResponse.json(created, { status: 201 });
}
