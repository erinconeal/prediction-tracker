import { NextResponse } from 'next/server';
import { filterAndSortPredictions } from '@/lib/prediction-query';
import { getTopicBySlug } from '@/lib/repositories/topic-repository';
import { loadAllPredictions } from '@/lib/repositories/prediction-repository';

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const topic = await getTopicBySlug(slug);
  if (!topic) {
    return NextResponse.json({ message: 'Topic not found' }, { status: 404 });
  }

  const predictions = await filterAndSortPredictions(await loadAllPredictions(), { topic: topic.slug });
  return NextResponse.json({
    ...topic,
    predictionCount: predictions.length,
  });
}
