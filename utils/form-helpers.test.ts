import { describe, expect, test } from 'vitest';
import { isHttpOrHttpsUrl, readString, readStringList } from './form-helpers';

describe('readString', () => {
  test('given a string field, should return that value.', () => {
    const form = new FormData();
    form.set('source', 'Jane Pundit');

    expect(readString(form, 'source')).toBe('Jane Pundit');
  });

  test('given a missing field, should return an empty string.', () => {
    expect(readString(new FormData(), 'source')).toBe('');
  });

  test('given a file field, should return an empty string.', () => {
    const form = new FormData();
    form.set('source', new File(['x'], 'note.txt'));

    expect(readString(form, 'source')).toBe('');
  });
});

describe('readStringList', () => {
  test('given repeated string values, should keep unique ids in first-seen order.', () => {
    const form = new FormData();
    form.append('topicIds', 'tech');
    form.append('topicIds', 'sports');
    form.append('topicIds', 'tech');

    expect(readStringList(form, 'topicIds')).toEqual(['tech', 'sports']);
  });

  test('given empty strings and files, should omit them.', () => {
    const form = new FormData();
    form.append('topicIds', '');
    form.append('topicIds', new File(['x'], 'note.txt'));
    form.append('topicIds', 'tech');

    expect(readStringList(form, 'topicIds')).toEqual(['tech']);
  });

  test('given a missing field, should return an empty list.', () => {
    expect(readStringList(new FormData(), 'topicIds')).toEqual([]);
  });
});

describe('isHttpOrHttpsUrl', () => {
  test('given http or https URLs, should accept them.', () => {
    expect(isHttpOrHttpsUrl('http://example.com/quote')).toBe(true);
    expect(isHttpOrHttpsUrl('https://example.com/quote')).toBe(true);
    expect(isHttpOrHttpsUrl('  https://example.com/quote  ')).toBe(true);
  });

  test('given javascript, ftp, empty, or invalid values, should reject them.', () => {
    expect(isHttpOrHttpsUrl('javascript:alert(1)')).toBe(false);
    expect(isHttpOrHttpsUrl('ftp://example.com/quote')).toBe(false);
    expect(isHttpOrHttpsUrl('')).toBe(false);
    expect(isHttpOrHttpsUrl('not-a-url')).toBe(false);
  });
});
