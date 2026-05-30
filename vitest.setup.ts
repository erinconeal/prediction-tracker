import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import './test/mocks/next-link';

afterEach(() => {
  cleanup();
});
