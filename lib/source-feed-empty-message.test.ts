import { describe, expect, test } from 'vitest';
import { sourceFeedEmptyMessage } from './source-feed-empty-message';

describe('sourceFeedEmptyMessage', () => {
  test('given all filter, should use default empty copy', () => {
    expect(sourceFeedEmptyMessage('all')).toBe(
      'No forecasts recorded for this source yet.',
    );
  });

  test('given still open filter, should use still-open-specific copy', () => {
    expect(sourceFeedEmptyMessage('still_open')).toBe(
      'No still open forecasts for this source.',
    );
  });
});
