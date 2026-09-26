import { describe, expect, test } from 'vitest';
import {
  firstStaffAddErrorFocusId,
  parseStaffAddFormValues,
} from './staff-add-form-values';

function buildStaffAddFormData({
  source = 'Jane Pundit',
  text = 'Markets will rally',
  created_at = '2026-01-01',
  target_date,
  evidenceUrl = 'https://example.com/quote',
  topicIds = ['topic-1'],
  staffSecret = 'secret',
}: {
  source?: string;
  text?: string;
  created_at?: string;
  target_date?: string;
  evidenceUrl?: string;
  topicIds?: string[];
  staffSecret?: string;
} = {}): FormData {
  const form = new FormData();
  form.set('source', source);
  form.set('text', text);
  form.set('created_at', created_at);
  if (target_date !== undefined) form.set('target_date', target_date);
  form.set('evidenceUrl', evidenceUrl);
  for (const id of topicIds) form.append('topicIds', id);
  form.set('staffSecret', staffSecret);
  return form;
}

describe('parseStaffAddFormValues', () => {
  test('given a filled form, should produce CreatePredictionInput + staffSecret and omit empty target_date', () => {
    const result = parseStaffAddFormValues(buildStaffAddFormData({
      source: 'test',
      text: 'test',
      evidenceUrl: 'https://example.com',
      created_at: '2026-01-01',
      topicIds: ['1', '2', '3'],
      staffSecret: 'test',
    }));

    expect(result).toEqual({
      ok: true,
      staffSecret: 'test',
      input: {
        source: 'test',
        text: 'test',
        created_at: '2026-01-01',
        evidenceUrl: 'https://example.com',
        topicIds: ['1', '2', '3'],
      },
    });
  });

  test('given a deadline, should keep target_date on the create input.', () => {
    const result = parseStaffAddFormValues(buildStaffAddFormData({
      target_date: '2026-12-31',
    }));

    expect(result).toEqual({
      ok: true,
      staffSecret: 'secret',
      input: {
        source: 'Jane Pundit',
        text: 'Markets will rally',
        created_at: '2026-01-01',
        target_date: '2026-12-31',
        evidenceUrl: 'https://example.com/quote',
        topicIds: ['topic-1'],
      },
    });
  });

  test('Given no topics, should return a validation error and not an input.', () => {
    const result = parseStaffAddFormValues(buildStaffAddFormData({ topicIds: [] }));

    expect(result).toEqual({
      ok: false,
      errors: {
        topicIds: 'Select at least one topic',
      },
    });
  });

  test('Given whitespace-only source/text, should fail required checks.', () => {
    const result = parseStaffAddFormValues(buildStaffAddFormData({
      source: ' ',
      text: ' ',
    }));

    expect(result).toEqual({
      ok: false,
      errors: {
        source: 'Source name is required',
        text: 'Prediction text is required',
      },
    });
  });

  test('given an empty date said, should require created_at.', () => {
    const result = parseStaffAddFormValues(buildStaffAddFormData({ created_at: '' }));

    expect(result).toEqual({
      ok: false,
      errors: {
        created_at: 'Date said is required',
      },
    });
  });

  test('given a non-date date said, should reject created_at before create.', () => {
    const result = parseStaffAddFormValues(buildStaffAddFormData({ created_at: 'not-a-date' }));

    expect(result).toEqual({
      ok: false,
      errors: {
        created_at: 'Date said must be a valid date in YYYY-MM-DD format',
      },
    });
  });

  test('given an empty staff secret, should require the secret.', () => {
    const result = parseStaffAddFormValues(buildStaffAddFormData({ staffSecret: '' }));

    expect(result).toEqual({
      ok: false,
      errors: {
        staffSecret: 'Staff password is required',
      },
    });
  });

  test('given a non-URL evidence value, should reject the evidence URL.', () => {
    const result = parseStaffAddFormValues(buildStaffAddFormData({
      evidenceUrl: 'not-a-url',
    }));

    expect(result).toEqual({
      ok: false,
      errors: {
        evidenceUrl: 'Evidence URL must be an http or https link',
      },
    });
  });

  test('given a javascript evidence URL, should reject the evidence URL.', () => {
    const result = parseStaffAddFormValues(buildStaffAddFormData({
      evidenceUrl: 'javascript:alert(1)',
    }));

    expect(result).toEqual({
      ok: false,
      errors: {
        evidenceUrl: 'Evidence URL must be an http or https link',
      },
    });
  });
});

describe('firstStaffAddErrorFocusId', () => {
  test('given several field errors, should return the earliest control id in form order.', () => {
    expect(firstStaffAddErrorFocusId({
      source: 'Source name is required',
      text: 'Prediction text is required',
    })).toBe('source');
  });

  test('given only later field errors, should skip valid fields and map created_at to dateSaid.', () => {
    expect(firstStaffAddErrorFocusId({
      created_at: 'Date said is required',
      topicIds: 'Select at least one topic',
    })).toBe('dateSaid');
  });

  test('given no field errors, should return undefined.', () => {
    expect(firstStaffAddErrorFocusId({})).toBeUndefined();
  });
});
