import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { OutcomeBadge } from './OutcomeBadge';

describe('OutcomeBadge', () => {
  test('renders visible label for each outcome', () => {
    const { rerender } = render(<OutcomeBadge outcome="correct" />);
    expect(screen.getByText('Correct')).toBeVisible();

    rerender(<OutcomeBadge outcome="still_open" />);
    expect(screen.getByText('Still open')).toBeVisible();
  });
});
