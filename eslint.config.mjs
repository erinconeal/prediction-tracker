import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import stylistic from '@stylistic/eslint-plugin';
import testingLibrary from 'eslint-plugin-testing-library';
import mockImportFirst from './eslint-rules/mock-import-first.mjs';
import noImplementationAssertions from './eslint-rules/no-implementation-assertions.mjs';

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  stylistic.configs.recommended,
  stylistic.configs.customize(
    {
      semi: true,
    },
  ),
  {
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      eqeqeq: ['error', 'always'],
    },
  },
  {
    files: ['**/*.{test,spec}.{ts,tsx}'],
    plugins: {
      'test-conventions': {
        rules: {
          'mock-import-first': mockImportFirst,
          'no-implementation-assertions': noImplementationAssertions,
        },
      },
      'testing-library': testingLibrary,
    },
    rules: {
      'test-conventions/mock-import-first': 'error',
      'test-conventions/no-implementation-assertions': 'error',
      ...testingLibrary.configs['flat/react'].rules,
      'testing-library/no-node-access': 'error',
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
    'ai/scaffolds/**',
    'eslint-rules/**',
  ]),
]);

export default eslintConfig;
