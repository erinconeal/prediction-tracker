import { beforeEach, describe, expect, test, vi } from 'vitest';
import { loadRouteModule } from '@/test/helpers/load-route-module';

describe('GET /api/leaderboard route', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  test('should return paginated leaderboard page', async () => {
    const { GET } = await loadRouteModule(() => import('./route'));
    const response = await GET(new Request('http://localhost/api/leaderboard'));
    const body = (await response.json()) as {
      rows: Array<{
        rank: number;
        source: string;
        accuracyPercent: number | null;
        streakKind: 'correct' | 'incorrect' | null;
        streakLength: number;
      }>;
      total: number;
      rankedCount: number;
      offset: number;
      limit: number;
      hasMore: boolean;
      displayStats: {
        distinctSourcesWithScored: number;
        totalScored: number;
        topSourceScored: number;
      };
      showFullRankings: boolean;
    };

    expect(response.status).toBe(200);
    expect(Array.isArray(body.rows)).toBe(true);
    expect(body.rows.length).toBeGreaterThan(0);
    expect(body.rows[0]!.rank).toBe(1);
    expect(typeof body.rows[0]!.source).toBe('string');
    expect(typeof body.total).toBe('number');
    expect(typeof body.hasMore).toBe('boolean');
    expect(typeof body.showFullRankings).toBe('boolean');
    expect(body.displayStats.totalScored).toBeGreaterThan(0);
    expect(
      body.rows[0]!.streakKind === null
      || body.rows[0]!.streakKind === 'correct'
      || body.rows[0]!.streakKind === 'incorrect',
    ).toBe(true);
    expect(typeof body.rows[0]!.streakLength).toBe('number');
  });

  test('given invalid limit and offset, should clamp query params', async () => {
    const { GET } = await loadRouteModule(() => import('./route'));
    const response = await GET(
      new Request('http://localhost/api/leaderboard?limit=999&offset=-5&limit=abc'),
    );
    const body = (await response.json()) as {
      limit: number;
      offset: number;
      rows: unknown[];
    };

    expect(response.status).toBe(200);
    expect(body.limit).toBe(50);
    expect(body.offset).toBe(0);
    expect(body.rows.length).toBeGreaterThan(0);
  });

  test('given offset beyond total, should return empty rows and hasMore false', async () => {
    const { GET } = await loadRouteModule(() => import('./route'));
    const first = await GET(new Request('http://localhost/api/leaderboard?limit=1'));
    const firstBody = (await first.json()) as { total: number };
    const response = await GET(
      new Request(`http://localhost/api/leaderboard?limit=10&offset=${firstBody.total + 100}`),
    );
    const body = (await response.json()) as {
      rows: unknown[];
      hasMore: boolean;
      offset: number;
    };

    expect(response.status).toBe(200);
    expect(body.rows).toEqual([]);
    expect(body.hasMore).toBe(false);
    expect(body.offset).toBe(firstBody.total + 100);
  });
});
