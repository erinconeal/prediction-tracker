import { describe, expect, it } from 'vitest';
import {
  extractMethodologyToc,
  slugifyMethodologyHeading,
} from './methodology-toc';

describe('slugifyMethodologyHeading', () => {
  it('lowercases and hyphenates', () => {
    expect(slugifyMethodologyHeading('1. Purpose')).toBe('1-purpose');
  });

  it('strips punctuation', () => {
    expect(slugifyMethodologyHeading('Scope (v1 Constraints)')).toBe(
      'scope-v1-constraints',
    );
  });

  it('falls back for empty-ish input', () => {
    expect(slugifyMethodologyHeading('???')).toBe('section');
  });
});

describe('extractMethodologyToc', () => {
  it('extracts levels and assigns unique ids', () => {
    const md = `## First\n### Nested\n## Second\n### Nested\n`;
    const toc = extractMethodologyToc(md);
    expect(toc).toEqual([
      { level: 2, text: 'First', id: 'first' },
      { level: 3, text: 'Nested', id: 'nested' },
      { level: 2, text: 'Second', id: 'second' },
      { level: 3, text: 'Nested', id: 'nested-2' },
    ]);
  });

  it('ignores headings inside fenced code', () => {
    const md = '## Real\n\`\`\`\n## Fake\n\`\`\`\n## After\n';
    const toc = extractMethodologyToc(md);
    expect(toc.map(e => e.text)).toEqual(['Real', 'After']);
  });

  it('parses h4', () => {
    const toc = extractMethodologyToc('#### Definitions\n');
    expect(toc).toEqual([{ level: 4, text: 'Definitions', id: 'definitions' }]);
  });
});
