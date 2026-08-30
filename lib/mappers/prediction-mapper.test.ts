import { describe, expect, test } from 'vitest';
import { normalizeTargetDate, toPrediction, toPredictionInsert } from './prediction-mapper';
import { predictions } from '@/lib/schema';

describe('normalizeTargetDate', () => {
  test('given YYYY-MM-DD, should return ISO string', () => {
    expect(normalizeTargetDate('2026-01-01')).toBe('2026-01-01T00:00:00.000Z');
  });

  test('given full ISO string, should return unchanged', () => {
    expect(normalizeTargetDate('2026-01-01T00:00:00.000Z')).toBe('2026-01-01T00:00:00.000Z');
  });

  test('given whitespace around date string, should return ISO string', () => {
    expect(normalizeTargetDate(' 2026-01-01 ')).toBe('2026-01-01T00:00:00.000Z');
  });

  test('given invalid date string, should throw error', () => {
    expect(() => normalizeTargetDate('invalid')).toThrow();
  });
});

describe('toPredictionInsert', () => {
  test('given whitespace around text, should trim', () => {
    const input = {
      source: 'Jane Analyst',
      text: '  Inflation will stay above 2% through Q4.  ',
      topicIds: ['topic-sp-hits-8000', 'topic-housing-market-2026'],
      target_date: '2026-12-31',
      created_at: '2026-01-01T00:00:00.000Z',
      evidenceUrl: 'https://example.com/jane-analyst/inflation-above-2pct',
    };
    const sourceId = 'source-jane-analyst';
    const createdAt = '2026-01-01T00:00:00.000Z';
    const expected = {
      id: expect.any(String),
      sourceId,
      text: 'Inflation will stay above 2% through Q4.',
      createdAt,
      finishedAt: null,
      targetDate: '2026-12-31T00:00:00.000Z',
      outcome: 'still_open',
      evidenceUrl: 'https://example.com/jane-analyst/inflation-above-2pct',
    };
    expect(toPredictionInsert(input, sourceId, createdAt)).toEqual(expected);
  });

  test('given https evidence URL, should persist it', () => {
    const input = {
      source: 'Jane Analyst',
      text: 'Inflation will stay above 2% through Q4.',
      topicIds: ['topic-sp-hits-8000', 'topic-housing-market-2026'],
      created_at: '2026-01-01T00:00:00.000Z',
      evidenceUrl: '  https://example.com/jane-analyst/inflation-above-2pct  ',
    };
    const result = toPredictionInsert(input, 'source-jane-analyst', '2026-01-01T00:00:00.000Z');
    expect(result.evidenceUrl).toBe('https://example.com/jane-analyst/inflation-above-2pct');
  });

  test('given target_date omitted, should set to null', () => {
    const input = {
      source: 'Jane Analyst',
      text: 'Inflation will stay above 2% through Q4.',
      topicIds: ['topic-sp-hits-8000', 'topic-housing-market-2026'],
      created_at: '2026-01-01T00:00:00.000Z',
      evidenceUrl: 'https://example.com/jane-analyst/inflation-above-2pct',
    };
    const sourceId = 'source-jane-analyst';
    const createdAt = '2026-01-01T00:00:00.000Z';
    const expected = {
      id: expect.any(String),
      sourceId,
      text: 'Inflation will stay above 2% through Q4.',
      createdAt,
      finishedAt: null,
      targetDate: null,
      outcome: 'still_open',
      evidenceUrl: 'https://example.com/jane-analyst/inflation-above-2pct',
    };
    expect(toPredictionInsert(input, sourceId, createdAt)).toEqual(expected);
  });

  test('given whitespace only target_date, should set to null', () => {
    const input = {
      source: 'Jane Analyst',
      text: 'Inflation will stay above 2% through Q4.',
      topicIds: ['topic-sp-hits-8000', 'topic-housing-market-2026'],
      target_date: '   ',
      created_at: '2026-01-01T00:00:00.000Z',
      evidenceUrl: 'https://example.com/jane-analyst/inflation-above-2pct',
    };
    const sourceId = 'source-jane-analyst';
    const createdAt = '2026-01-01T00:00:00.000Z';
    const expected = {
      id: expect.any(String),
      sourceId,
      text: 'Inflation will stay above 2% through Q4.',
      createdAt,
      finishedAt: null,
      targetDate: null,
      outcome: 'still_open',
      evidenceUrl: 'https://example.com/jane-analyst/inflation-above-2pct',
    };
    expect(toPredictionInsert(input, sourceId, createdAt)).toEqual(expected);
  });

  test('given full ISO string target_date, should return unchanged', () => {
    const input = {
      source: 'Jane Analyst',
      text: 'Inflation will stay above 2% through Q4.',
      topicIds: ['topic-sp-hits-8000', 'topic-housing-market-2026'],
      target_date: '2026-12-31T00:00:00.000Z',
      created_at: '2026-01-01T00:00:00.000Z',
      evidenceUrl: 'https://example.com/jane-analyst/inflation-above-2pct',
    };
    const sourceId = 'source-jane-analyst';
    const createdAt = '2026-01-01T00:00:00.000Z';

    const expected = {
      id: expect.any(String),
      sourceId,
      text: 'Inflation will stay above 2% through Q4.',
      createdAt,
      finishedAt: null,
      targetDate: '2026-12-31T00:00:00.000Z',
      outcome: 'still_open',
      evidenceUrl: 'https://example.com/jane-analyst/inflation-above-2pct',
    };
    expect(toPredictionInsert(input, sourceId, createdAt)).toEqual(expected);
  });

  test('given fixed fields, should return unchanged', () => {
    const input = {
      source: 'Jane Analyst',
      text: 'Inflation will stay above 2% through Q4.',
      topicIds: ['topic-sp-hits-8000', 'topic-housing-market-2026'],
      target_date: '2026-12-31',
      created_at: '2026-01-01T00:00:00.000Z',
      evidenceUrl: 'https://example.com/jane-analyst/inflation-above-2pct',
    };
    const sourceId = 'source-jane-analyst';
    const createdAt = '2026-01-01T00:00:00.000Z';
    const expected = {
      id: expect.any(String),
      sourceId,
      text: 'Inflation will stay above 2% through Q4.',
      createdAt,
      finishedAt: null,
      targetDate: '2026-12-31T00:00:00.000Z',
      outcome: 'still_open',
      evidenceUrl: 'https://example.com/jane-analyst/inflation-above-2pct',
    };
    expect(toPredictionInsert(input, sourceId, createdAt)).toEqual(expected);
  });

  test('given passed-through args, sourceId and createdAtIso should be unchanged', () => {
    const input = {
      source: 'Jane Analyst',
      text: 'Inflation will stay above 2% through Q4.',
      topicIds: ['topic-sp-hits-8000', 'topic-housing-market-2026'],
      target_date: '2026-12-31',
      created_at: '2026-01-01T00:00:00.000Z',
      evidenceUrl: 'https://example.com/jane-analyst/inflation-above-2pct',
    };
    const sourceId = 'source-jane-analyst';
    const createdAt = '2026-01-01T00:00:00.000Z';
    const expected = {
      id: expect.any(String),
      sourceId,
      text: 'Inflation will stay above 2% through Q4.',
      createdAt,
      finishedAt: null,
      targetDate: '2026-12-31T00:00:00.000Z',
      outcome: 'still_open',
      evidenceUrl: 'https://example.com/jane-analyst/inflation-above-2pct',
    };
    expect(toPredictionInsert(input, sourceId, createdAt)).toEqual(expected);
  });

  test('id is non-empty string', () => {
    const input = {
      source: 'Jane Analyst',
      text: 'Inflation will stay above 2% through Q4.',
      topicIds: ['topic-sp-hits-8000', 'topic-housing-market-2026'],
      target_date: '2026-12-31',
      created_at: '2026-01-01T00:00:00.000Z',
      evidenceUrl: 'https://example.com/jane-analyst/inflation-above-2pct',
    };
    const sourceId = 'source-jane-analyst';
    const createdAt = '2026-01-01T00:00:00.000Z';
    const result = toPredictionInsert(input, sourceId, createdAt);
    expect(result.id).toBeDefined();
    expect(result.id).not.toBe('');
  });
});

describe('toPrediction', () => {
  test('given prediction row, source row, and topic ids, should return prediction', () => {
    const predictionRow: typeof predictions.$inferSelect = {
      id: 'prediction-123',
      sourceId: 'source-jane-analyst',
      text: 'Inflation will stay above 2% through Q4.',
      createdAt: '2026-01-01T00:00:00.000Z',
      finishedAt: null,
      targetDate: '2026-12-31T00:00:00.000Z',
      outcome: 'still_open',
      evidenceUrl: null,
    };
    const sourceRow = {
      id: 'source-jane-analyst',
      slug: 'jane-analyst',
      displayName: 'Jane Analyst',
      profileUrl: null,
      active: true,
    };
    const topicIds = ['topic-sp-hits-8000', 'topic-housing-market-2026'];
    const expected = {
      id: 'prediction-123',
      source: 'Jane Analyst',
      sourceSlug: 'jane-analyst',
      text: 'Inflation will stay above 2% through Q4.',
      created_at: '2026-01-01T00:00:00.000Z',
      finished_at: null,
      target_date: '2026-12-31T00:00:00.000Z',
      outcome: 'still_open',
      evidenceUrl: null,
      topicIds: ['topic-sp-hits-8000', 'topic-housing-market-2026'],
    };
    expect(toPrediction(predictionRow, sourceRow, topicIds)).toEqual(expected);
  });

  test('given topicIds passthrough, should return as-is', () => {
    const predictionRow: typeof predictions.$inferSelect = {
      id: 'prediction-123',
      sourceId: 'source-jane-analyst',
      text: 'Inflation will stay above 2% through Q4.',
      createdAt: '2026-01-01T00:00:00.000Z',
      finishedAt: null,
      targetDate: '2026-12-31T00:00:00.000Z',
      outcome: 'still_open',
      evidenceUrl: null,
    };
    const sourceRow = {
      id: 'source-jane-analyst',
      slug: 'jane-analyst',
      displayName: 'Jane Analyst',
      profileUrl: null,
      active: true,
    };
    const topicIds = ['topic-sp-hits-8000', 'topic-housing-market-2026'];
    const expected = {
      id: 'prediction-123',
      source: 'Jane Analyst',
      sourceSlug: 'jane-analyst',
      text: 'Inflation will stay above 2% through Q4.',
      created_at: '2026-01-01T00:00:00.000Z',
      finished_at: null,
      target_date: '2026-12-31T00:00:00.000Z',
      outcome: 'still_open',
      evidenceUrl: null,
      topicIds: ['topic-sp-hits-8000', 'topic-housing-market-2026'],
    };
    expect(toPrediction(predictionRow, sourceRow, topicIds)).toEqual(expected);
  });

  test('given row with evidence URL, should expose it on the prediction', () => {
    const predictionRow: typeof predictions.$inferSelect = {
      id: 'prediction-123',
      sourceId: 'source-jane-analyst',
      text: 'Inflation will stay above 2% through Q4.',
      createdAt: '2026-01-01T00:00:00.000Z',
      finishedAt: null,
      targetDate: '2026-12-31T00:00:00.000Z',
      outcome: 'still_open',
      evidenceUrl: 'https://example.com/jane-analyst/inflation-above-2pct',
    };
    const sourceRow = {
      id: 'source-jane-analyst',
      slug: 'jane-analyst',
      displayName: 'Jane Analyst',
      profileUrl: null,
      active: true,
    };
    const result = toPrediction(
      predictionRow,
      sourceRow,
      ['topic-sp-hits-8000'],
    );
    expect(result.evidenceUrl).toBe(
      'https://example.com/jane-analyst/inflation-above-2pct',
    );
  });
});
