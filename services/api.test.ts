import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { buildPrediction } from '@/test/factories/prediction';
import {
  ApiError,
  createPrediction,
  getPrediction,
  getTopic,
  listLeaderboard,
  listPredictions,
  updatePredictionOutcome,
} from './api';

function jsonResponse(body: unknown, init?: ResponseInit): Response {
  const bodyText
    = typeof body === 'string' ? body : JSON.stringify(body);
  return new Response(bodyText, {
    status: init?.status ?? 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

describe('listPredictions', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('given default filters, should GET /api/predictions with no-store and Accept header', async () => {
    const row = buildPrediction();
    fetchMock.mockResolvedValue(jsonResponse([row]));

    await listPredictions({});

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/predictions',
      expect.objectContaining({
        method: 'GET',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      }),
    );
  });

  test('given source and non-all status, should append query parameters', async () => {
    fetchMock.mockResolvedValue(jsonResponse([]));

    await listPredictions({ source: '  Bob  ', status: 'correct' });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/predictions?source=Bob&status=correct',
      expect.anything(),
    );
  });

  test('given topic limit and offset, should append query parameters', async () => {
    fetchMock.mockResolvedValue(jsonResponse([]));

    await listPredictions({
      topic: 'tech',
      limit: 20,
      offset: 40,
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/predictions?topic=tech&limit=20&offset=40',
      expect.anything(),
    );
  });

  test('given non-default sort, should append sort query parameter', async () => {
    fetchMock.mockResolvedValue(jsonResponse([]));

    await listPredictions({ sort: 'recently_finished', limit: 10, offset: 0 });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/predictions?limit=10&offset=0&sort=recently_finished',
      expect.anything(),
    );
  });

  test('given default newest sort, should omit sort query parameter', async () => {
    fetchMock.mockResolvedValue(jsonResponse([]));

    await listPredictions({ sort: 'newest', topic: 'tech' });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/predictions?topic=tech',
      expect.anything(),
    );
  });

  test('given ok JSON array, should return predictions', async () => {
    const row = buildPrediction({ id: 'x' });
    fetchMock.mockResolvedValue(jsonResponse([row]));

    const result = await listPredictions({});

    expect(result).toEqual([row]);
  });

  test('given ok body that is not JSON, should throw ApiError', async () => {
    fetchMock.mockResolvedValue(
      new Response('not-json{', {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(listPredictions({})).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Invalid JSON response',
    });
  });

  test('given ok JSON that is not an array, should throw ApiError', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ predictions: [] }));

    await expect(listPredictions({})).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Predictions response must be a JSON array',
    });
  });

  test('given non-ok response with message in JSON body, should throw ApiError with that message', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ message: 'Source required' }, { status: 400 }),
    );

    await expect(listPredictions({})).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Source required',
      status: 400,
    });
  });

  test('given non-ok response with empty body, should throw ApiError with status fallback', async () => {
    fetchMock.mockResolvedValue(new Response('', { status: 502 }));

    await expect(listPredictions({})).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Request failed with 502',
      status: 502,
    });
  });

  test('given response with (message: 123)', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: 123 }, { status: 400 }));

    await expect(listPredictions({})).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Request failed with 400',
      status: 400,
    });
  });
});

describe('getPrediction', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('should GET encoded id', async () => {
    const row = buildPrediction({ id: 'abc' });
    fetchMock.mockResolvedValue(jsonResponse(row));

    const result = await getPrediction('abc');

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/predictions/abc',
      expect.objectContaining({ method: 'GET', cache: 'no-store' }),
    );
    expect(result).toEqual(row);
  });
});

describe('getTopic', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('should GET encoded slug with abort signal', async () => {
    const topic = {
      id: 'topic-ai',
      slug: 'ai-regulation-2026',
      name: 'AI regulation 2026',
      kind: 'curated',
      parentTopicIds: [],
      predictionCount: 2,
    };
    fetchMock.mockResolvedValue(jsonResponse(topic));
    const signal = new AbortController().signal;

    const result = await getTopic('ai-regulation-2026', signal);

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/topics/ai-regulation-2026',
      expect.objectContaining({ method: 'GET', cache: 'no-store', signal }),
    );
    expect(result).toEqual(topic);
  });

  test('given 404, should throw ApiError', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ message: 'Topic not found' }, { status: 404 }),
    );

    await expect(getTopic('missing')).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Topic not found',
      status: 404,
    });
  });

  test('given invalid kind, should throw ApiError', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        id: 'topic-x',
        slug: 'mystery',
        name: 'Mystery',
        kind: 'unknown',
        parentTopicIds: [],
        predictionCount: 0,
      }),
    );

    await expect(getTopic('mystery')).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Topic response must include a slug and a known kind',
      status: 200,
    });
  });

  test('given missing slug, should throw ApiError', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        id: 'topic-x',
        name: 'Mystery',
        kind: 'curated',
        parentTopicIds: [],
        predictionCount: 0,
      }),
    );

    await expect(getTopic('mystery')).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Topic response must include a slug and a known kind',
      status: 200,
    });
  });

  test('given non-object success body, should throw ApiError', async () => {
    fetchMock.mockResolvedValue(jsonResponse(null));

    await expect(getTopic('mystery')).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Topic response must include a slug and a known kind',
      status: 200,
    });
  });
});

describe('listLeaderboard', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('default should GET /api/leaderboard', async () => {
    const page = {
      rows: [{ rank: 1, source: 'A' }],
      total: 1,
      rankedCount: 1,
      offset: 0,
      limit: 8,
      hasMore: false,
      displayStats: {
        distinctSourcesWithScored: 1,
        totalScored: 1,
        topSourceScored: 1,
      },
      showFullRankings: false,
    };
    fetchMock.mockResolvedValue(jsonResponse(page));

    const result = await listLeaderboard();

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/leaderboard',
      expect.objectContaining({ method: 'GET' }),
    );
    expect(result).toEqual(page);
  });

  test('given limit and offset, should append query params', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        rows: [],
        total: 0,
        rankedCount: 0,
        offset: 50,
        limit: 50,
        hasMore: false,
        displayStats: {
          distinctSourcesWithScored: 0,
          totalScored: 0,
          topSourceScored: 0,
        },
        showFullRankings: false,
      }),
    );

    await listLeaderboard({ limit: 50, offset: 50 });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/leaderboard?limit=50&offset=50',
      expect.objectContaining({ method: 'GET' }),
    );
  });
});

describe('createPrediction', () => {
  const fetchMock = vi.fn<typeof fetch>();
  const input = {
    source: 'Bob',
    text: 'Stocks up',
    topicIds: ['topic-finance'],
    created_at: '2026-01-05T14:00:00.000Z',
    evidenceUrl: 'https://example.com/bob/stocks-up',
  };

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('given 201 with prediction JSON, should return parsed prediction', async () => {
    const created = buildPrediction({ id: 'new' });
    fetchMock.mockResolvedValue(jsonResponse(created, { status: 201 }));

    const result = await createPrediction(input, { staffSecret: 'staff-secret' });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/predictions',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(input),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-staff-secret': 'staff-secret',
        },
      }),
    );
    expect(result).toEqual(created);
  });

  test('given no staff secret, should omit the staff header', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(buildPrediction({ id: 'new' }), { status: 201 }),
    );

    await createPrediction(input);

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/predictions',
      expect.objectContaining({
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }),
    );
  });

  test('given error JSON, should throw ApiError with message', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ message: 'Invalid payload' }, { status: 422 }),
    );

    await expect(
      createPrediction({
        source: 'x',
        text: 'y',
        topicIds: [],
        created_at: '2026-01-05T14:00:00.000Z',
        evidenceUrl: 'https://example.com/x/y',
      }),
    ).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Invalid payload',
      status: 422,
    });
  });
});

describe('updatePredictionOutcome', () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('given ok response, should PATCH encoded id with outcome body', async () => {
    const updated = buildPrediction({ id: 'a/b', outcome: 'correct' });
    fetchMock.mockResolvedValue(jsonResponse(updated));

    const result = await updatePredictionOutcome('a/b', 'correct', {
      staffSecret: 'staff-secret',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/predictions/a%2Fb',
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ outcome: 'correct' }),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-staff-secret': 'staff-secret',
        },
      }),
    );
    expect(result).toEqual(updated);
  });

  test('given no staff secret, should omit the staff header', async () => {
    fetchMock.mockResolvedValue(jsonResponse(buildPrediction({ id: 'a/b' })));

    await updatePredictionOutcome('a/b', 'correct');

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/predictions/a%2Fb',
      expect.objectContaining({
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      }),
    );
  });

  test('given non-ok response, should throw ApiError', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ message: 'Not found' }, { status: 404 }),
    );

    await expect(
      updatePredictionOutcome('missing', 'incorrect'),
    ).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Not found',
      status: 404,
    });
  });
});

describe('ApiError', () => {
  test('given constructor args, should expose status and optional body', () => {
    const err = new ApiError('oops', 500, { detail: 'x' });
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe('oops');
    expect(err.status).toBe(500);
    expect(err.body).toEqual({ detail: 'x' });
  });
});
