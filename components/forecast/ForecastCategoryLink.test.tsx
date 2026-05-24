import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { ForecastCategoryLink } from './ForecastCategoryLink';

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

describe('ForecastCategoryLink', () => {
  test('renders a muted category link without an icon', () => {
    render(<ForecastCategoryLink category="Finance" />);
    const link = screen.getByRole('link', { name: 'Browse Finance forecasts' });
    expect(link).toHaveAttribute('href', '/category/finance');
    expect(link).toHaveClass('text-muted', 'uppercase');
    expect(link).toHaveTextContent('Finance');
  });

  test('has aria-label for category', () => {
    render(<ForecastCategoryLink category="Finance" />);
    expect(
      screen.getByRole('link', { name: 'Browse Finance forecasts' }),
    ).toHaveAttribute('aria-label', 'Browse Finance forecasts');
  });

  test('does not display a link for unknown "Misc" category', () => {
    render(<ForecastCategoryLink category="Misc" />);
    const label = screen.getByText('Misc');
    expect(label).toHaveClass('uppercase');
    expect(label).not.toHaveAttribute('href');
  });
});
