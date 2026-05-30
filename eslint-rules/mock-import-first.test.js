import { RuleTester } from 'eslint';
import { describe, test } from 'vitest';
import mockImportFirst from './mock-import-first.mjs';

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
});

describe('mock-import-first', () => {
  test('enforces side-effect mock import order in test files', () => {
    ruleTester.run('mock-import-first', mockImportFirst, {
      valid: [
        {
          code: `
import '@/test/mocks/api-service';
import { renderHook } from '@testing-library/react';
import { listPredictions } from '@/test/mocks/api-service';
import { usePredictions } from './usePredictions';
`,
        },
        {
          code: `
import '@/test/mocks/api-service';
import '@/test/mocks/next-navigation';
import { render } from '@testing-library/react';
import { listPredictions } from '@/test/mocks/api-service';
`,
        },
        {
          code: `
import { render } from '@testing-library/react';
import { usePredictions } from './usePredictions';
`,
        },
      ],
      invalid: [
        {
          code: `
import { render } from '@testing-library/react';
import '@/test/mocks/use-topic-catalog';
`,
          errors: [{ messageId: 'mockImportFirst' }],
        },
        {
          code: `
import { listPredictions } from '@/test/mocks/api-service';
import { renderHook } from '@testing-library/react';
`,
          errors: [{ messageId: 'mockSideEffectRequired' }],
        },
        {
          code: `
import { render } from '@testing-library/react';
import { listPredictions } from '@/test/mocks/api-service';
`,
          errors: [{ messageId: 'mockSideEffectRequired' }],
        },
        {
          code: `
import '@/test/mocks/api-service';
import { render } from '@testing-library/react';
import '@/test/mocks/next-navigation';
`,
          errors: [{ messageId: 'mockImportFirst' }],
        },
      ],
    });
  });
});
