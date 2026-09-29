import { describe, expect, test } from 'vitest';
import {
  firstStaffAddErrorFocusId,
  parseStaffAddFormValues,
} from './staff-add-form-values';

function buildStaffAddFormData({
  source = 'Jane Pundit',
  text = 'Markets will rally',
  created_at = '2026-01-01',
  target_date = '2026-12-31',
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
  form.set('target_date', target_date);
  form.set('evidenceUrl', evidenceUrl);
  for (const id of topicIds) form.append('topicIds', id);
  form.set('staffSecret', staffSecret);
  return form;
}

describe('parseStaffAddFormValues', () => {
  test('given a filled form, should produce CreatePredictionInput and staffSecret.', () => {
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
        target_date: '2026-12-31',
        evidenceUrl: 'https://example.com',
        topicIds: ['1', '2', '3'],
      },
    });
  });

  test('given a deadline after the date said, should keep target_date on the create input.', () => {
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

  test('given an empty deadline, should require the deadline.', () => {
    const result = parseStaffAddFormValues(buildStaffAddFormData({ target_date: '' }));

    expect(result).toEqual({
      ok: false,
      errors: {
        target_date: 'Deadline is required',
      },
    });
  });

  test('given a deadline on the date said, should reject target_date.', () => {
    const result = parseStaffAddFormValues(buildStaffAddFormData({
      target_date: '2026-01-01',
    }));

    expect(result).toEqual({
      ok: false,
      errors: {
        target_date: 'Deadline date must be after date said',
      },
    });
  });

  test('given a deadline that is not a date, should reject target_date.', () => {
    const result = parseStaffAddFormValues(buildStaffAddFormData({
      target_date: 'not-a-date',
    }));

    expect(result).toEqual({
      ok: false,
      errors: {
        target_date: 'Deadline must be a valid date in YYYY-MM-DD format',
      },
    });
  });

  test('given an invalid date said and a deadline, should reject created_at.', () => {
    const result = parseStaffAddFormValues(buildStaffAddFormData({
      created_at: 'not-a-date',
      target_date: '2026-12-31',
    }));

    expect(result).toEqual({
      ok: false,
      errors: {
        created_at: 'Date said must be a valid date in YYYY-MM-DD format',
      },
    });
  });

  test('given an empty date said and a deadline, should require created_at.', () => {
    const result = parseStaffAddFormValues(buildStaffAddFormData({
      created_at: '',
      target_date: '2026-12-31',
    }));

    expect(result).toEqual({
      ok: false,
      errors: {
        created_at: 'Date said is required',
      },
    });
  });

  test('given an empty date said and an invalid deadline, should reject both fields.', () => {
    const result = parseStaffAddFormValues(buildStaffAddFormData({
      created_at: '',
      target_date: 'not-a-date',
    }));

    expect(result).toEqual({
      ok: false,
      errors: {
        created_at: 'Date said is required',
        target_date: 'Deadline must be a valid date in YYYY-MM-DD format',
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

  test('given a deadline error after a valid date said, should focus the deadline control.', () => {
    expect(firstStaffAddErrorFocusId({
      target_date: 'Deadline is required',
      evidenceUrl: 'Evidence URL must be an http or https link',
    })).toBe('deadline');
  });

  test('given date said and deadline errors, should focus date said first.', () => {
    expect(firstStaffAddErrorFocusId({
      created_at: 'Date said is required',
      target_date: 'Deadline is required',
    })).toBe('dateSaid');
  });

  test('given no field errors, should return undefined.', () => {
    expect(firstStaffAddErrorFocusId({})).toBeUndefined();
  });
});
