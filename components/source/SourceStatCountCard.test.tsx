import { render, screen, within } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { SourceStatCountCard } from './SourceStatCountCard';
import { STAT_NO_LONGER_OPEN_HINT } from '@/lib/lifecycle-copy';

describe('SourceStatCountCard', () => {
  test('given label and value, should render count without popover', () => {
    render(<SourceStatCountCard label="Total predictions" value={12} />);

    expect(screen.getByText('Total predictions')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  test('given about hint, should render InfoPopover trigger', () => {
    render(
      <SourceStatCountCard
        label="No longer open"
        value={4}
        about={{
          popoverLabel: 'About No longer open',
          hint: STAT_NO_LONGER_OPEN_HINT,
        }}
      />,
    );

    const card = screen.getByRole('group', { name: 'No longer open' });
    expect(
      within(card).getByRole('button', {
        name: 'About No longer open',
      }),
    ).toBeInTheDocument();
    expect(within(card).getByText('4')).toBeInTheDocument();
  });
});
