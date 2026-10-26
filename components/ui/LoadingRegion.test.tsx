import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { LoadingRegion } from './LoadingRegion';
import { Skeleton } from './Skeleton';

describe('LoadingRegion', () => {
  test('given a label, should announce a busy status', () => {
    render(
      <LoadingRegion label="Loading predictions">
        <Skeleton />
      </LoadingRegion>,
    );

    const status = screen.getByRole('status', { name: 'Loading predictions' });
    expect(status).toHaveAttribute('aria-busy', 'true');
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  test('given a list, should keep the list element as the status', () => {
    render(
      <LoadingRegion as="ul" label="Loading predictions">
        <li>
          <Skeleton />
        </li>
      </LoadingRegion>,
    );

    const status = screen.getByRole('status', { name: 'Loading predictions' });
    expect(status.tagName).toBe('UL');
    expect(status).toHaveAttribute('aria-busy', 'true');
  });

  test('given an aside, should keep the aside element as the status', () => {
    render(
      <LoadingRegion as="aside" label="Source statistics">
        <Skeleton />
      </LoadingRegion>,
    );

    const status = screen.getByRole('status', { name: 'Source statistics' });
    expect(status.tagName).toBe('ASIDE');
  });
});
