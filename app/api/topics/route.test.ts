import { beforeEach, describe, expect, test, vi } from 'vitest';
import { loadRouteModule } from '@/test/helpers/load-route-module';

describe('GET /api/topics route', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  test('given no query params, should return a non-empty topic list', async () => {
    const { GET } = await loadRouteModule(() => import('./route'));
    const response = await GET(new Request('http://localhost/api/topics'));
    const body = (await response.json()) as Array<{
      id: string;
      slug: string;
      name: string;
    }>;

    expect(response.status).toBe(200);
    expect(body.length).toBeGreaterThan(0);
    expect(body.every(row => typeof row.slug === 'string')).toBe(true);
  });

  test('given trending=true, should return topics with counts', async () => {
    const { GET } = await loadRouteModule(() => import('./route'));
    const response = await GET(
      new Request('http://localhost/api/topics?trending=true&limit=3'),
    );
    const body = (await response.json()) as Array<{
      slug: string;
      count: number;
      recentCount: number;
    }>;

    expect(response.status).toBe(200);
    expect(body.length).toBeGreaterThan(0);
    expect(body.length).toBeLessThanOrEqual(3);
    expect(
      body.every(
        row =>
          typeof row.count === 'number' && typeof row.recentCount === 'number',
      ),
    ).toBe(true);
  });

  test('given unknown bucket slug, should return an empty array', async () => {
    const { GET } = await loadRouteModule(() => import('./route'));
    const response = await GET(
      new Request('http://localhost/api/topics?bucket=not-a-bucket'),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual([]);
  });
});
