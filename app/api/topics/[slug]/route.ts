import { NextResponse } from "next/server";
import { filterAndSortPredictions } from "@/lib/prediction-store";
import { getTopicBySlug } from "@/lib/topic-store";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  const topic = getTopicBySlug(slug);
  if (!topic) {
    return NextResponse.json({ message: "Topic not found" }, { status: 404 });
  }

  const predictions = filterAndSortPredictions({ topic: topic.slug });
  return NextResponse.json({
    ...topic,
    predictionCount: predictions.length,
  });
}
