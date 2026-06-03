import { describe, expect, it } from 'vitest';
import {
  LIFECYCLE_GLOSSARY_TOC_ENTRY,
  methodologyTocWithLifecycleGlossary,
} from './methodology-toc';
import { LIFECYCLE_GLOSSARY_ANCHOR } from './lifecycle-copy';

describe('methodologyTocWithLifecycleGlossary', () => {
  it('given constitution entries, should prepend the lifecycle glossary link', () => {
    const toc = methodologyTocWithLifecycleGlossary([
      { level: 2, text: 'Purpose', id: 'purpose' },
    ]);

    expect(toc[0]).toEqual(LIFECYCLE_GLOSSARY_TOC_ENTRY);
    expect(toc[0]?.id).toBe(LIFECYCLE_GLOSSARY_ANCHOR);
    expect(toc[1]?.text).toBe('Purpose');
  });
});
