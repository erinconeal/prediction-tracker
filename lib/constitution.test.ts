import { describe, expect, it } from 'vitest';
import {
  readLeadingAtxHeadingText,
  stripLeadingAtxHeading,
} from './constitution';

describe('stripLeadingAtxHeading', () => {
  it('removes the first ATX H1 and following blank lines', () => {
    const input = '# Title\n\n## Next\nbody';
    expect(stripLeadingAtxHeading(input)).toBe('## Next\nbody');
  });

  it('handles H1-only content', () => {
    expect(stripLeadingAtxHeading('# Only')).toBe('');
  });

  it('leaves markdown unchanged when there is no leading H1', () => {
    const input = '## Starts at two\n';
    expect(stripLeadingAtxHeading(input)).toBe(input);
  });

  it('strips leading H1 after trimStart removes whitespace before the H1', () => {
    const input = '  \n# Hi\n\nx';
    expect(stripLeadingAtxHeading(input)).toBe('x');
  });
});

describe('readLeadingAtxHeadingText', () => {
  it('returns the first H1 text without hashes', () => {
    expect(readLeadingAtxHeadingText('# Hello world\n\nMore')).toBe(
      'Hello world',
    );
  });

  it('returns null when there is no H1', () => {
    expect(readLeadingAtxHeadingText('## No\n')).toBeNull();
  });
});
