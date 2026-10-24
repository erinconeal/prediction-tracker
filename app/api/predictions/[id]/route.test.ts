import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { jsonStaffHeaders } from '@/test/helpers/json-staff-headers';
import { loadRouteModule } from '@/test/helpers/load-route-module';

async function loadRoutes() {
  return loadRouteModule(async () => {
    const collection = await import('../route');
    const item = await import('./route');
    return { ...collection, ...item };
  });
}

async function createBody(source: string, text: string) {
  const { listTopics } = await import('@/lib/repositories/topic-repository');
  const topic = (await listTopics()).find(t => t.slug === 'ai-regulation-2026');
  if (!topic) throw new Error('seeded topic ai-regulation-2026 missing');

  return {
    source,
    text,
    topicIds: [topic.id],
    created_at: '2026-01-05T14:00:00.000Z',
    evidenceUrl: 'https://example.com/evidence',
  };
}

describe('GET /api/predictions/[id] route', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  test('given unknown id, should return 404', async () => {
    const { GET } = await loadRoutes();
    const response = await GET(
      new Request('http://localhost/api/predictions/nope'),
      { params: Promise.resolve({ id: 'nope' }) },
    );
    const body = (await response.json()) as { message: string };

    expect(response.status).toBe(404);
    expect(body.message).toBe('Prediction not found');
  });

  test('given existing id, should return prediction row', async () => {
    const { POST, GET } = await loadRoutes();
    const createRequest = new Request('http://localhost/api/predictions', {
      method: 'POST',
      headers: jsonStaffHeaders,
      body: JSON.stringify(await createBody('GET Source', 'Row for GET')),
    });
    const created = (await (await POST(createRequest)).json()) as {
      id: string;
      text: string;
    };

    const response = await GET(
      new Request(`http://localhost/api/predictions/${created.id}`),
      { params: Promise.resolve({ id: created.id }) },
    );
    const body = (await response.json()) as { id: string; text: string };

    expect(response.status).toBe(200);
    expect(body.id).toBe(created.id);
    expect(body.text).toBe('Row for GET');
  });
});

describe('PATCH /api/predictions/[id] route', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-24T00:00:00.000Z'));
    vi.resetModules();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('given missing staff secret header, should return 401', async () => {
    const { PATCH } = await loadRoutes();
    const request = new Request('http://localhost/api/predictions/x', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ outcome: 'correct' }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: 'x' }) });
    const body = (await response.json()) as { message: string };

    expect(response.status).toBe(401);
    expect(body.message).toBe('Unauthorized');
  });

  test('given wrong staff secret header, should return 401', async () => {
    const { PATCH } = await loadRoutes();
    const request = new Request('http://localhost/api/predictions/x', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-staff-secret': 'wrong-secret',
      },
      body: JSON.stringify({ outcome: 'correct' }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: 'x' }) });
    const body = (await response.json()) as { message: string };

    expect(response.status).toBe(401);
    expect(body.message).toBe('Unauthorized');
  });

  test('given invalid JSON body, should return 400', async () => {
    const { PATCH } = await loadRoutes();
    const request = new Request('http://localhost/api/predictions/x', {
      method: 'PATCH',
      headers: jsonStaffHeaders,
      body: '{ bad-json',
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: 'x' }) });
    const body = (await response.json()) as { message: string };

    expect(response.status).toBe(400);
    expect(body.message).toBe('Invalid JSON body');
  });

  test('given unsupported outcome, should return 400', async () => {
    const { PATCH } = await loadRoutes();
    const request = new Request('http://localhost/api/predictions/x', {
      method: 'PATCH',
      headers: jsonStaffHeaders,
      body: JSON.stringify({ outcome: 'still_open' }),
    });

    const response = await PATCH(request, { params: Promise.resolve({ id: 'x' }) });
    const body = (await response.json()) as { message: string };

    expect(response.status).toBe(400);
    expect(body.message).toContain('must be');
  });

  test('given unknown id, should return 404', async () => {
    const { PATCH } = await loadRoutes();
    const request = new Request('http://localhost/api/predictions/does-not-exist', {
      method: 'PATCH',
      headers: jsonStaffHeaders,
      body: JSON.stringify({ outcome: 'correct' }),
    });

    const response = await PATCH(request, {
      params: Promise.resolve({ id: 'does-not-exist' }),
    });
    const body = (await response.json()) as { message: string };

    expect(response.status).toBe(404);
    expect(body.message).toBe('Prediction not found');
  });

  test('given existing id and unresolved outcome, should patch and return updated row', async () => {
    const { POST, PATCH } = await loadRoutes();
    const createRequest = new Request('http://localhost/api/predictions', {
      method: 'POST',
      headers: jsonStaffHeaders,
      body: JSON.stringify({
        ...(await createBody('Patch Source', 'Update me')),
        target_date: '2026-06-01',
      }),
    });
    const created = (await (await POST(createRequest)).json()) as {
      id: string;
      outcome: string;
    };

    const patchRequest = new Request(
      `http://localhost/api/predictions/${created.id}`,
      {
        method: 'PATCH',
        headers: jsonStaffHeaders,
        body: JSON.stringify({ outcome: 'unresolved' }),
      },
    );
    const response = await PATCH(patchRequest, {
      params: Promise.resolve({ id: created.id }),
    });
    const body = (await response.json()) as {
      id: string;
      outcome: string;
      finished_at: string | null;
    };

    expect(response.status).toBe(200);
    expect(body.id).toBe(created.id);
    expect(body.outcome).toBe('unresolved');
    expect(typeof body.finished_at).toBe('string');
  });

  test('given existing id and incorrect outcome, should patch and return updated row', async () => {
    const { POST, PATCH } = await loadRoutes();
    const createRequest = new Request('http://localhost/api/predictions', {
      method: 'POST',
      headers: jsonStaffHeaders,
      body: JSON.stringify({
        ...(await createBody('Patch Source', 'Update me')),
        target_date: '2026-06-01',
      }),
    });
    const created = (await (await POST(createRequest)).json()) as {
      id: string;
      outcome: string;
    };

    const patchRequest = new Request(
      `http://localhost/api/predictions/${created.id}`,
      {
        method: 'PATCH',
        headers: jsonStaffHeaders,
        body: JSON.stringify({
          outcome: 'incorrect',
          resolutionUrl: 'https://example.com/result',
        }),
      },
    );
    const response = await PATCH(patchRequest, {
      params: Promise.resolve({ id: created.id }),
    });
    const body = (await response.json()) as {
      id: string;
      outcome: string;
      finished_at: string | null;
      resolutionUrl: string | null;
    };

    expect(response.status).toBe(200);
    expect(body.id).toBe(created.id);
    expect(body.outcome).toBe('incorrect');
    expect(body.resolutionUrl).toBe('https://example.com/result');
    expect(typeof body.finished_at).toBe('string');
  });

  test('given the deadline has not passed, should return 409', async () => {
    const { GET, POST, PATCH } = await loadRoutes();
    const createRequest = new Request('http://localhost/api/predictions', {
      method: 'POST',
      headers: jsonStaffHeaders,
      body: JSON.stringify({
        ...(await createBody('Patch Source', 'Update me')),
        target_date: '2099-01-01',
      }),
    });
    const created = (await (await POST(createRequest)).json()) as {
      id: string;
      outcome: string;
    };

    const patchRequest = new Request(
      `http://localhost/api/predictions/${created.id}`,
      {
        method: 'PATCH',
        headers: jsonStaffHeaders,
        body: JSON.stringify({
          outcome: 'correct',
          resolutionUrl: 'https://example.com/result',
        }),
      },
    );
    const response = await PATCH(patchRequest, {
      params: Promise.resolve({ id: created.id }),
    });
    const body = (await response.json()) as { message: string };

    const saved = await GET(
      new Request(`http://localhost/api/predictions/${created.id}`),
      { params: Promise.resolve({ id: created.id }) },
    );
    const row = (await saved.json()) as {
      outcome: string;
      finished_at: string | null;
      resolutionUrl: string | null;
    };

    expect(saved.status).toBe(200);
    expect(row.outcome).toBe('still_open');
    expect(row.finished_at).toBeNull();
    expect(row.resolutionUrl).toBeNull();

    expect(response.status).toBe(409);
    expect(body.message).toBe('deadline_not_passed');
  });

  test('given a score is missing a resolutionUrl, should return 409', async () => {
    const { GET, POST, PATCH } = await loadRoutes();
    const createRequest = new Request('http://localhost/api/predictions', {
      method: 'POST',
      headers: jsonStaffHeaders,
      body: JSON.stringify({
        ...(await createBody('Patch Source', 'Update me')),
        target_date: '2026-06-01',
      }),
    });
    const created = (await (await POST(createRequest)).json()) as {
      id: string;
      outcome: string;
    };

    const patchRequest = new Request(
      `http://localhost/api/predictions/${created.id}`,
      {
        method: 'PATCH',
        headers: jsonStaffHeaders,
        body: JSON.stringify({
          outcome: 'correct',
        }),
      },
    );
    const response = await PATCH(patchRequest, {
      params: Promise.resolve({ id: created.id }),
    });
    const body = (await response.json()) as { message: string };

    const saved = await GET(
      new Request(`http://localhost/api/predictions/${created.id}`),
      { params: Promise.resolve({ id: created.id }) },
    );
    const row = (await saved.json()) as {
      outcome: string;
      finished_at: string | null;
      resolutionUrl: string | null;
    };

    expect(saved.status).toBe(200);
    expect(row.outcome).toBe('still_open');
    expect(row.finished_at).toBeNull();
    expect(row.resolutionUrl).toBeNull();

    expect(response.status).toBe(409);
    expect(body.message).toBe('resolution_url_required');
  });

  test('given an already scored row, should return 409 and keep the first score', async () => {
    const { GET, POST, PATCH } = await loadRoutes();
    const createRequest = new Request('http://localhost/api/predictions', {
      method: 'POST',
      headers: jsonStaffHeaders,
      body: JSON.stringify({
        ...(await createBody('Patch Source', 'Update me')),
        target_date: '2026-06-01',
      }),
    });
    const created = (await (await POST(createRequest)).json()) as {
      id: string;
      outcome: string;
    };

    const patchRequest = new Request(
      `http://localhost/api/predictions/${created.id}`,
      {
        method: 'PATCH',
        headers: jsonStaffHeaders,
        body: JSON.stringify({
          outcome: 'incorrect',
          resolutionUrl: 'https://example.com/result',
        }),
      },
    );
    await PATCH(patchRequest, {
      params: Promise.resolve({ id: created.id }),
    });

    const saved = await GET(
      new Request(`http://localhost/api/predictions/${created.id}`),
      { params: Promise.resolve({ id: created.id }) },
    );
    const row = (await saved.json()) as {
      outcome: string;
      finished_at: string | null;
      resolutionUrl: string | null;
    };

    expect(saved.status).toBe(200);
    expect(row.outcome).toBe('incorrect');
    expect(row.resolutionUrl).toBe('https://example.com/result');

    const secondPatchRequest = new Request(
      `http://localhost/api/predictions/${created.id}`,
      {
        method: 'PATCH',
        headers: jsonStaffHeaders,
        body: JSON.stringify({ outcome: 'correct' }),
      },
    );
    const secondResponse = await PATCH(secondPatchRequest, {
      params: Promise.resolve({ id: created.id }),
    });
    const secondBody = (await secondResponse.json()) as { message: string };

    const secondGet = await GET(
      new Request(`http://localhost/api/predictions/${created.id}`),
      { params: Promise.resolve({ id: created.id }) },
    );
    const secondRow = (await secondGet.json()) as {
      outcome: string;
      finished_at: string | null;
      resolutionUrl: string | null;
    };

    expect(secondResponse.status).toBe(409);
    expect(secondBody.message).toBe('already_terminal');
    expect(secondGet.status).toBe(200);
    expect(secondRow.outcome).toBe('incorrect');
    expect(secondRow.resolutionUrl).toBe('https://example.com/result');
  });

  test('given a deadline that has not passed, should allow invalid', async () => {
    const { POST, PATCH } = await loadRoutes();
    const createRequest = new Request('http://localhost/api/predictions', {
      method: 'POST',
      headers: jsonStaffHeaders,
      body: JSON.stringify({
        ...(await createBody('Patch Source', 'Update me')),
        target_date: '2099-01-01',
      }),
    });
    const created = (await (await POST(createRequest)).json()) as {
      id: string;
      outcome: string;
    };

    const patchRequest = new Request(
      `http://localhost/api/predictions/${created.id}`,
      {
        method: 'PATCH',
        headers: jsonStaffHeaders,
        body: JSON.stringify({ outcome: 'invalid' }),
      },
    );
    const response = await PATCH(patchRequest, {
      params: Promise.resolve({ id: created.id }),
    });
    const body = (await response.json()) as { outcome: string; resolutionUrl: string | null };

    expect(response.status).toBe(200);
    expect(body.outcome).toBe('invalid');
  });
});
