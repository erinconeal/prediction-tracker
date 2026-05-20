import { describe, expect, test } from 'vitest';
import { categoryDisplayFromName } from './category-display';

describe('categoryDisplayFromName', () => {
  test('maps Weather, Sports, and Historical to distinct icon wrap classes', () => {
    expect(categoryDisplayFromName('Weather').iconWrapClass).toContain('info');
    expect(categoryDisplayFromName('Sports').iconWrapClass).toContain(
      'accent-attention',
    );
    expect(categoryDisplayFromName('Historical').iconWrapClass).toContain(
      'muted',
    );
  });

  test('still maps legacy categories', () => {
    expect(categoryDisplayFromName('Finance').iconWrapClass).toContain(
      'interactive',
    );
    expect(categoryDisplayFromName('Tech').iconWrapClass).toContain('primary');
    expect(categoryDisplayFromName('Politics').iconWrapClass).toContain('ink');
  });
});
