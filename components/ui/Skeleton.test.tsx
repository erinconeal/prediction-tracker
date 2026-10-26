import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { LoadingRegion } from './LoadingRegion';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  test('given a placeholder, should stay out of the accessibility tree', () => {
    render(
      <LoadingRegion label="Loading predictions">
        <Skeleton />
      </LoadingRegion>,
    );

    const status = screen.getByRole('status', { name: 'Loading predictions' });
    expect(status).toHaveAttribute('aria-busy', 'true');
    expect(status).toHaveTextContent('');
  });
});
