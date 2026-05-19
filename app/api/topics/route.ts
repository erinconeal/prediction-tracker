import { NextResponse } from "next/server";
import { filterAndSortPredictions } from "@/lib/prediction-store";
import { rankTrendingTopics } from "@/lib/trending-topics";
import { listTopics, listTopicsForCategory } from "@/lib/topic-store";
import { categoryFromSlug } from "@/types/category";

function parseQueryInt(value: string | null, fallback: number): number {
  if (value === null || value === "") return fallback;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const trending = searchParams.get("trending") === "true";
  const limit = Math.min(Math.max(1, parseQueryInt(searchParams.get("limit"), 6)), 50);
  const categoryParam = searchParams.get("category");

  if (trending) {
    const predictions = filterAndSortPredictions();
    let pool = listTopics();
    if (categoryParam?.trim()) {
      const cat = categoryFromSlug(categoryParam);
      if (cat) {
        pool = listTopicsForCategory(cat);
      }
    }
    const ranked = rankTrendingTopics(pool, predictions, { limit });
    return NextResponse.json(
      ranked.map(({ topic, count, recentCount }) => ({
        ...topic,
        count,
        recentCount,
      })),
    );
  }

  const categorySlug = categoryParam?.trim();
  if (categorySlug) {
    const cat = categoryFromSlug(categorySlug);
    if (!cat) {
      return NextResponse.json([]);
    }
    return NextResponse.json(listTopicsForCategory(cat));
  }

  return NextResponse.json(listTopics());
}
