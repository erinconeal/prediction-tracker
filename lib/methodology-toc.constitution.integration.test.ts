import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { stripLeadingAtxHeading } from './constitution';
import { extractMethodologyToc } from './methodology-toc';

describe('extractMethodologyToc (constitution.md)', () => {
  it('matches golden snapshot and assigns unique ids for the shipped constitution', () => {
    const raw = readFileSync(
      path.join(process.cwd(), 'constitution.md'),
      'utf8',
    );
    const markdown = stripLeadingAtxHeading(raw);
    const toc = extractMethodologyToc(markdown);

    expect(toc.length).toBeGreaterThan(0);

    const ids = toc.map(e => e.id);
    expect(new Set(ids).size).toBe(ids.length);

    expect(toc).toMatchSnapshot();
  });
});
