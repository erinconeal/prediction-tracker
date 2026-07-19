import { NextResponse } from 'next/server';
import { rankTrendingTopics } from '@/lib/trending-topics';
import {
  listTopics,
  listCuratedTopics,
  listTopicsForBucket,
} from '@/lib/repositories/topic-repository';
import { loadAllPredictions } from '@/lib/repositories/prediction-repository';
import { filterAndSortPredictions } from '@/lib/prediction-query';

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
    const predictions = await filterAndSortPredictions(await loadAllPredictions());
    let pool = await listCuratedTopics();
    if (bucketParam?.trim()) {
      pool = await listTopicsForBucket(bucketParam.trim());
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
    return NextResponse.json(await listTopicsForBucket(bucketSlug));
  }

  return NextResponse.json(await listTopics());
}
