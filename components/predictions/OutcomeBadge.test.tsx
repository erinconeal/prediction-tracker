import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { OutcomeBadge } from './OutcomeBadge';

describe('OutcomeBadge', () => {
  test('renders visible label and decorative icon for each outcome', () => {
    const { rerender } = render(<OutcomeBadge outcome="correct" />);
    expect(screen.getByText('Correct')).toBeVisible();
    expect(screen.getByText('Correct').parentElement?.querySelector('svg')).toHaveAttribute(
      'aria-hidden',
    );

    rerender(<OutcomeBadge outcome="still_open" />);
    expect(screen.getByText('Still open')).toBeVisible();
  });
});
