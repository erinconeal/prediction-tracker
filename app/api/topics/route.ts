import { NextResponse } from 'next/server';
import { filterAndSortPredictions } from '@/lib/prediction-store';
import { rankTrendingTopics } from '@/lib/trending-topics';
import {
  listCuratedTopics,
  listTopics,
  listTopicsForBucket,
} from '@/lib/topic-store';

function parseQueryInt(value: string | null, fallback: number): number {
  if (value === null || value === '') return fallback;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const trending = searchParams.get('trending') === 'true';
  const limit = Math.min(Math.max(1, parseQueryInt(searchParams.get('limit'), 6)), 50);
  const bucketParam = searchParams.get('bucket');

  if (trending) {
    const predictions = filterAndSortPredictions();
    let pool = listCuratedTopics();
    if (bucketParam?.trim()) {
      pool = listTopicsForBucket(bucketParam.trim());
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

  const bucketSlug = bucketParam?.trim();
  if (bucketSlug) {
    return NextResponse.json(listTopicsForBucket(bucketSlug));
  }

  return NextResponse.json(listTopics());
}
