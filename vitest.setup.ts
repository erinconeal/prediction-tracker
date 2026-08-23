import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import './test/mocks/next-link';

// Pin UTC so date helpers (e.g. formatFinishedRelativeTime "Yesterday") have stable calendar-day boundaries across machines.
process.env.TZ = 'UTC';
process.env.STAFF_SECRET = 'test-staff-secret';

afterEach(() => {
  cleanup();
});
