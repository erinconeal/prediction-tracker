import { beforeEach, describe, expect, test, vi } from 'vitest';
import { loadRouteModule } from '@/test/helpers/load-route-module';
import { jsonStaffHeaders } from '@/test/helpers/json-staff-headers';

async function loadRoutes() {
  return loadRouteModule(async () => {
    const collection = await import('../route');
    const item = await import('./route');
    return { ...collection, ...item };
  });
}

function createBody(source: string, text: string) {
  return {
    source,
    text,
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
      body: JSON.stringify(createBody('GET Source', 'Row for GET')),
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
    vi.resetModules();
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
      body: JSON.stringify(createBody('Patch Source', 'Update me')),
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
      body: JSON.stringify(createBody('Patch Source', 'Update me')),
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
        body: JSON.stringify({ outcome: 'incorrect' }),
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
    expect(body.outcome).toBe('incorrect');
    expect(typeof body.finished_at).toBe('string');
  });
});
