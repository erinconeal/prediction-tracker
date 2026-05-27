import { describe, expect, test } from 'vitest';
import { topicDisplayFromName } from './topic-display';

describe('topicDisplayFromName', () => {
  test('maps Finance to finance styling', () => {
    const d = topicDisplayFromName('Finance');
    expect(d.label).toBe('Finance');
    expect(d.iconWrapClass).toContain('interactive');
  });

  test('maps Tech to tech styling', () => {
    const d = topicDisplayFromName('Tech');
    expect(d.label).toBe('Tech');
    expect(d.iconWrapClass).toContain('primary');
  });

  test('falls back for unknown labels', () => {
    const d = topicDisplayFromName('Misc');
    expect(d.label).toBe('Misc');
  });
});
