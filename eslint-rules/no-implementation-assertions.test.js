import { RuleTester } from 'eslint';
import { describe, test } from 'vitest';
import noImplementationAssertions from './no-implementation-assertions.mjs';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
});

describe('no-implementation-assertions', () => {
  test('bans implementation-detail assertions in test files', () => {
    ruleTester.run(
      'no-implementation-assertions',
      noImplementationAssertions,
      {
        valid: [
          {
            code: `
expect(screen.getByRole('button', { name: /submit/i })).toBeVisible();
`,
          },
          {
            code: `
const className = 'text-primary';
`,
          },
        ],
        invalid: [
          {
            code: `expect(el).toHaveClass('sr-only');`,
            errors: [{ messageId: 'toHaveClass' }],
          },
          {
            code: `expect(container.querySelector('ul')).toBeNull();`,
            errors: [{ messageId: 'querySelector' }],
          },
          {
            code: `expect(el.className).toMatch(/text-white/);`,
            errors: [{ messageId: 'className' }],
          },
        ],
      },
    );
  });
});
