import { describe, expect, test } from 'vitest';
import { parseCreatePredictionBody } from './parse-create-prediction-body';

const validBody = {
  source: 'Jane Analyst',
  text: 'Inflation will stay above 2% through Q4.',
  created_at: '2026-01-05T14:00:00.000Z',
  evidenceUrl: 'https://example.com/jane-analyst/inflation-above-2pct',
};

describe('parseCreatePredictionBody', () => {
  test('given a valid body, should return create input', () => {
    const result = parseCreatePredictionBody({
      ...validBody,
      topicIds: ['topic-sp-hits-8000'],
      target_date: '2026-12-31',
    });
    expect(result).toEqual({
      ok: true,
      value: {
        source: 'Jane Analyst',
        text: 'Inflation will stay above 2% through Q4.',
        topicIds: ['topic-sp-hits-8000'],
        target_date: '2026-12-31',
        created_at: '2026-01-05T14:00:00.000Z',
        evidenceUrl: 'https://example.com/jane-analyst/inflation-above-2pct',
      },
    });
  });

  test('given a non-object body, should reject', () => {
    expect(parseCreatePredictionBody(null)).toEqual({
      ok: false,
      message: 'Expected object body',
    });
  });

  test('given missing source and text, should reject', () => {
    expect(parseCreatePredictionBody({ source: ' ', text: '' })).toEqual({
      ok: false,
      message: '`source` and `text` are required strings',
    });
  });

  test('given missing statement time, should reject', () => {
    expect(parseCreatePredictionBody({ ...validBody, created_at: undefined })).toEqual({
      ok: false,
      message: '`created_at` is required and must be an ISO date or YYYY-MM-DD',
    });
  });

  test('given invalid statement time, should reject', () => {
    expect(parseCreatePredictionBody({
      ...validBody,
      created_at: 'not-a-date',
    })).toEqual({
      ok: false,
      message: '`created_at` is required and must be an ISO date or YYYY-MM-DD',
    });
  });

  test('given YYYY-MM-DD statement time, should normalize to ISO', () => {
    const result = parseCreatePredictionBody({
      ...validBody,
      created_at: '2026-01-05',
    });
    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        created_at: '2026-01-05T00:00:00.000Z',
      }),
    });
  });

  test('given missing evidence URL, should reject', () => {
    expect(parseCreatePredictionBody({ ...validBody, evidenceUrl: undefined })).toEqual({
      ok: false,
      message: '`evidenceUrl` is required and must be an http: or https: URL',
    });
  });

  test('given a javascript URL, should reject', () => {
    expect(parseCreatePredictionBody({
      ...validBody,
      evidenceUrl: 'javascript:alert(1)',
    })).toEqual({
      ok: false,
      message: '`evidenceUrl` is required and must be an http: or https: URL',
    });
  });

  test('given whitespace around an https URL, should trim it', () => {
    const result = parseCreatePredictionBody({
      ...validBody,
      evidenceUrl: '  https://example.com/jane-analyst/inflation-above-2pct  ',
    });
    expect(result).toEqual({
      ok: true,
      value: expect.objectContaining({
        evidenceUrl: 'https://example.com/jane-analyst/inflation-above-2pct',
      }),
    });
  });
});
