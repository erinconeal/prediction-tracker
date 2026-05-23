import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { ForecastCategoryChip } from './ForecastCategoryChip';

vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...rest
  }: {
    children: ReactNode;
    href: string;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

describe('ForecastCategoryChip', () => {
  test('renders a category chip with a link', () => {
    render(<ForecastCategoryChip category="Finance" />);
    expect(screen.getByRole('link', { name: 'Browse Finance forecasts' })).toHaveAttribute('href', '/category/finance');
  });

  test('has aria-label for category', () => {
    render(<ForecastCategoryChip category="Finance" />);
    expect(screen.getByRole('link', { name: 'Browse Finance forecasts' })).toHaveAttribute('aria-label', 'Browse Finance forecasts');
  });

  test('does not display a link for unknown "Misc" category', () => {
    render(<ForecastCategoryChip category="Misc" />);
    expect(screen.getByText('MISC')).toBeInTheDocument();
    expect(screen.getByText('MISC')).not.toHaveAttribute('href');
  });
});
