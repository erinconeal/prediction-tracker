import { beforeEach, describe, expect, test, vi } from 'vitest';
import { loadRouteModule } from '@/test/helpers/load-route-module';
import { jsonStaffHeaders } from '@/test/helpers/json-staff-headers';

describe('GET /api/predictions route', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  test('given no query params, should return a non-empty list of prediction rows', async () => {
    const { GET } = await loadRouteModule(() => import('./route'));
    const request = new Request('http://localhost/api/predictions');

    const response = await GET(request);
    const body = (await response.json()) as Array<{
      id: string;
      source: string;
      text: string;
      outcome: string;
    }>;

    expect(response.status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBeGreaterThan(0);
    expect(
      body.every(
        row =>
          typeof row.id === 'string'
          && typeof row.source === 'string'
          && typeof row.text === 'string'
          && ['still_open', 'correct', 'incorrect', 'unresolved', 'invalid'].includes(
            row.outcome,
          ),
      ),
    ).toBe(true);
  });

  test('given known status filter, should return only matching outcomes', async () => {
    const { GET } = await loadRouteModule(() => import('./route'));
    const request = new Request('http://localhost/api/predictions?status=correct');

    const response = await GET(request);
    const body = (await response.json()) as Array<{ outcome: string }>;

    expect(response.status).toBe(200);
    expect(body.length).toBeGreaterThan(0);
    expect(body.every(row => row.outcome === 'correct')).toBe(true);
  });

  test('given unknown status filter, should ignore it instead of erroring', async () => {
    const { GET } = await loadRouteModule(() => import('./route'));
    const allRequest = new Request('http://localhost/api/predictions');
    const unknownStatusRequest = new Request(
      'http://localhost/api/predictions?status=nope',
    );

    const allResponse = await GET(allRequest);
    const unknownStatusResponse = await GET(unknownStatusRequest);
    const allBody = (await allResponse.json()) as unknown[];
    const unknownStatusBody = (await unknownStatusResponse.json()) as unknown[];

    expect(unknownStatusResponse.status).toBe(200);
    expect(unknownStatusBody).toEqual(allBody);
  });

  test('given source query by slug, should filter by source', async () => {
    const { GET } = await loadRouteModule(() => import('./route'));
    const request = new Request(
      'http://localhost/api/predictions?source=jane-analyst',
    );

    const response = await GET(request);
    const body = (await response.json()) as Array<{ source: string }>;

    expect(response.status).toBe(200);
    expect(body.length).toBeGreaterThan(0);
    expect(body.every(row => row.source === 'Jane Analyst')).toBe(true);
  });

  test('given topic query, should return only predictions linked to that topic', async () => {
    const { predictionMatchesTopicSlug } = await import(
      '@/lib/prediction-topic-match',
    );
    const { GET } = await loadRouteModule(() => import('./route'));
    const request = new Request(
      'http://localhost/api/predictions?topic=ai-regulation-2026',
    );

    const response = await GET(request);
    const body = (await response.json()) as import('@/types/prediction').Prediction[];

    expect(response.status).toBe(200);
    expect(body.length).toBeGreaterThan(0);
    expect(
      await Promise.all(
        body.map(row => predictionMatchesTopicSlug(row, 'ai-regulation-2026')),
      ),
    ).toEqual(body.map(() => true));
  });

  test('given bucket topic query, should return roll-up matches', async () => {
    const { predictionMatchesTopicSlug } = await import(
      '@/lib/prediction-topic-match',
    );
    const { GET } = await loadRouteModule(() => import('./route'));
    const request = new Request(
      'http://localhost/api/predictions?topic=finance',
    );

    const response = await GET(request);
    const body = (await response.json()) as import('@/types/prediction').Prediction[];

    expect(response.status).toBe(200);
    expect(body.length).toBeGreaterThan(0);
    expect(
      body.every(row => predictionMatchesTopicSlug(row, 'finance')),
    ).toBe(true);
  });

  test('given limit and offset, should return stable page slices', async () => {
    const { GET } = await loadRouteModule(() => import('./route'));
    const first = await GET(
      new Request('http://localhost/api/predictions?limit=1&offset=0'),
    );
    const second = await GET(
      new Request('http://localhost/api/predictions?limit=1&offset=1'),
    );
    const a = (await first.json()) as Array<{ id: string }>;
    const b = (await second.json()) as Array<{ id: string }>;

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(a).toHaveLength(1);
    expect(b).toHaveLength(1);
    expect(a[0]!.id).not.toBe(b[0]!.id);
  });

  test('given sort=recently_finished, should list resolved rows before still_open', async () => {
    const { GET } = await loadRouteModule(() => import('./route'));
    // Use max page size so both finished and still_open rows can appear when
    // finished count is near the default limit of 50.
    const response = await GET(
      new Request(
        'http://localhost/api/predictions?sort=recently_finished&limit=100',
      ),
    );
    const body = (await response.json()) as Array<{
      outcome: string;
      finished_at: string | null;
    }>;

    expect(response.status).toBe(200);
    expect(body.length).toBeGreaterThanOrEqual(4);
    expect(body.some(r => r.outcome !== 'still_open')).toBe(true);

    // Finished rows must never appear after a still_open row.
    const firstStillOpenIndex = body.findIndex(r => r.outcome === 'still_open');
    if (firstStillOpenIndex === -1) {
      expect(body.every(r => r.outcome !== 'still_open')).toBe(true);
    }
    else {
      expect(
        body.slice(firstStillOpenIndex).every(r => r.outcome === 'still_open'),
      ).toBe(true);
    }
    expect(
      body
        .filter(r => r.outcome !== 'still_open')
        .every(r => typeof r.finished_at === 'string'),
    ).toBe(true);
  });

  test('given unknown sort param, should behave like default ordering', async () => {
    const { GET } = await loadRouteModule(() => import('./route'));
    const defaultReq = new Request('http://localhost/api/predictions');
    const weirdSortReq = new Request(
      'http://localhost/api/predictions?sort=not-a-sort',
    );
    const defaultBody = (await (await GET(defaultReq)).json()) as unknown[];
    const weirdBody = (await (await GET(weirdSortReq)).json()) as unknown[];

    expect(weirdBody).toEqual(defaultBody);
  });
});

describe('POST /api/predictions route', () => {
  const createPayload = {
    source: '  New Source  ',
    text: '  New prediction text  ',
    created_at: '2026-01-05T14:00:00.000Z',
    evidenceUrl: 'https://example.com/new-source/prediction',
  };

  beforeEach(() => {
    vi.resetModules();
  });

  test('given missing staff secret header, should return 401', async () => {
    const { POST } = await loadRouteModule(() => import('./route'));
    const request = new Request('http://localhost/api/predictions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'Staff Gate Source',
        text: 'Should not be created without a staff secret',
      }),
    });

    const response = await POST(request);
    const body = (await response.json()) as { message: string };

    expect(response.status).toBe(401);
    expect(body.message).toBe('Unauthorized');
  });

  test('given wrong staff secret header, should return 401', async () => {
    const { POST } = await loadRouteModule(() => import('./route'));
    const request = new Request('http://localhost/api/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-staff-secret': 'wrong-secret',
      },
      body: JSON.stringify({
        source: 'Staff Gate Source',
        text: 'Should not be created with a wrong staff secret',
      }),
    });

    const response = await POST(request);
    const body = (await response.json()) as { message: string };

    expect(response.status).toBe(401);
    expect(body.message).toBe('Unauthorized');
  });

  test('given invalid JSON body, should return 400', async () => {
    const { POST } = await loadRouteModule(() => import('./route'));
    const request = new Request('http://localhost/api/predictions', {
      method: 'POST',
      headers: jsonStaffHeaders,
      body: '{ invalid',
    });

    const response = await POST(request);
    const body = (await response.json()) as { message: string };

    expect(response.status).toBe(400);
    expect(body.message).toBe('Invalid JSON body');
  });

  test('given missing required strings, should return 400 validation error', async () => {
    const { POST } = await loadRouteModule(() => import('./route'));
    const request = new Request('http://localhost/api/predictions', {
      method: 'POST',
      headers: jsonStaffHeaders,
      body: JSON.stringify({ source: ' ', text: '' }),
    });

    const response = await POST(request);
    const body = (await response.json()) as { message: string };

    expect(response.status).toBe(400);
    expect(body.message).toContain('required strings');
  });

  test('given unknown topicIds, should return 400', async () => {
    const { POST } = await loadRouteModule(() => import('./route'));
    const request = new Request('http://localhost/api/predictions', {
      method: 'POST',
      headers: jsonStaffHeaders,
      body: JSON.stringify({
        source: 'New Source',
        text: 'New prediction text',
        topicIds: ['not-a-real-topic-id'],
        created_at: '2026-01-05T14:00:00.000Z',
        evidenceUrl: 'https://example.com/new-source/prediction',
      }),
    });

    const response = await POST(request);
    const body = (await response.json()) as { message: string };

    expect(response.status).toBe(400);
    expect(body.message).toContain('Unknown topicIds');
  });

  test('given valid topicIds, should create row and return 201', async () => {
    const { listTopics } = await import('@/lib/repositories/topic-repository');
    const topic = (await listTopics()).find(t => t.slug === 'ai-regulation-2026');
    expect(topic).toBeDefined();

    const { POST } = await loadRouteModule(() => import('./route'));
    const request = new Request('http://localhost/api/predictions', {
      method: 'POST',
      headers: jsonStaffHeaders,
      body: JSON.stringify({
        source: 'New Source',
        text: 'Linked to AI regulation topic',
        topicIds: [topic!.id],
        created_at: '2026-01-05T14:00:00.000Z',
        evidenceUrl: 'https://example.com/new-source/ai-regulation',
      }),
    });

    const response = await POST(request);
    const body = (await response.json()) as {
      topicIds: string[];
      outcome: string;
    };

    expect(response.status).toBe(201);
    expect(body.topicIds).toEqual([topic!.id]);
    expect(body.outcome).toBe('still_open');
  });

  test('given valid payload, should create row and return 201', async () => {
    const { POST } = await loadRouteModule(() => import('./route'));
    const request = new Request('http://localhost/api/predictions', {
      method: 'POST',
      headers: jsonStaffHeaders,
      body: JSON.stringify({
        ...createPayload,
        target_date: '2026-12-31',
      }),
    });

    const response = await POST(request);
    const body = (await response.json()) as {
      source: string;
      text: string;
      topicIds: string[];
      target_date: string | null;
      sourceSlug: string;
      outcome: string;
      id: string;
      created_at: string;
      evidenceUrl: string | null;
    };

    expect(response.status).toBe(201);
    expect(body.id).toBeTruthy();
    expect(body.source).toBe('New Source');
    expect(body.text).toBe('New prediction text');
    expect(body.topicIds).toEqual([]);
    expect(body.sourceSlug).toBe('new-source');
    expect(body.outcome).toBe('still_open');
    expect(body.target_date).toBe('2026-12-31T00:00:00.000Z');
    expect(body.created_at).toBe('2026-01-05T14:00:00.000Z');
    expect(body.evidenceUrl).toBe('https://example.com/new-source/prediction');
  });

  test('given missing statement time, should return 400', async () => {
    const { POST } = await loadRouteModule(() => import('./route'));
    const request = new Request('http://localhost/api/predictions', {
      method: 'POST',
      headers: jsonStaffHeaders,
      body: JSON.stringify({ ...createPayload, created_at: undefined }),
    });

    const response = await POST(request);
    const body = (await response.json()) as { message: string };

    expect(response.status).toBe(400);
    expect(body.message).toContain('created_at');
  });

  test('given invalid statement time, should return 400', async () => {
    const { POST } = await loadRouteModule(() => import('./route'));
    const request = new Request('http://localhost/api/predictions', {
      method: 'POST',
      headers: jsonStaffHeaders,
      body: JSON.stringify({ ...createPayload, created_at: 'not-a-date' }),
    });

    const response = await POST(request);
    const body = (await response.json()) as { message: string };

    expect(response.status).toBe(400);
    expect(body.message).toContain('created_at');
  });

  test('given a non-http evidence URL, should return 400', async () => {
    const { POST } = await loadRouteModule(() => import('./route'));
    const request = new Request('http://localhost/api/predictions', {
      method: 'POST',
      headers: jsonStaffHeaders,
      body: JSON.stringify({
        ...createPayload,
        evidenceUrl: 'javascript:alert(1)',
      }),
    });

    const response = await POST(request);
    const body = (await response.json()) as { message: string };

    expect(response.status).toBe(400);
    expect(body.message).toContain('evidenceUrl');
  });
});
