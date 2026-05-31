import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { RecentResolutionsWidget } from './RecentResolutionsWidget';
import { buildPrediction } from '@/test/factories/prediction';

vi.mock('@/utils/format-date', () => ({
  formatResolvedRelativeTime: () => '2h ago',
}));

describe('RecentResolutionsWidget', () => {
  test('given resolved items, should show heading, quoted excerpts, source, and links', () => {
    render(
      <RecentResolutionsWidget
        items={[
          {
            prediction: buildPrediction({
              id: 'p-correct',
              source: 'Alice',
              text: 'Q2 GDP will exceed expectations by 0.5%',
              outcome: 'correct',
              resolved_at: '2026-05-31T12:00:00.000Z',
            }),
            resolvedAt: '2026-05-31T12:00:00.000Z',
          },
          {
            prediction: buildPrediction({
              id: 'p-incorrect',
              source: 'Bob',
              text: 'New tech IPO will list at $45/share minimum',
              outcome: 'incorrect',
              resolved_at: '2026-05-31T09:00:00.000Z',
            }),
            resolvedAt: '2026-05-31T09:00:00.000Z',
          },
        ]}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Recent resolutions' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('"Q2 GDP will exceed expectations by 0.5%"'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('"New tech IPO will list at $45/share minimum"'),
    ).toBeInTheDocument();
    const correctLink = screen.getByRole('link', {
      name: /Q2 GDP will exceed expectations by 0\.5%/i,
    });
    const incorrectLink = screen.getByRole('link', {
      name: /New tech IPO will list at \$45\/share minimum/i,
    });
    expect(correctLink).toHaveTextContent('Alice');
    expect(correctLink).toHaveTextContent('Resolved 2h ago');
    expect(correctLink).toHaveTextContent('Correct');
    expect(incorrectLink).toHaveTextContent('Bob');
    expect(incorrectLink).toHaveTextContent('Resolved 2h ago');
    expect(correctLink).toHaveAttribute('href', '/predictions/p-correct');
    expect(incorrectLink).toHaveAttribute('href', '/predictions/p-incorrect');
  });

  test('given no items, should show empty state', () => {
    render(<RecentResolutionsWidget items={[]} />);

    expect(screen.getByText('No resolved forecasts yet.')).toBeInTheDocument();
  });

  test('given long prediction text, should truncate quoted excerpt', () => {
    const longText = 'A'.repeat(60);

    render(
      <RecentResolutionsWidget
        items={[
          {
            prediction: buildPrediction({
              id: 'p-long',
              text: longText,
              outcome: 'correct',
              resolved_at: '2026-05-31T12:00:00.000Z',
            }),
            resolvedAt: '2026-05-31T12:00:00.000Z',
          },
        ]}
      />,
    );

    expect(screen.getByText(`"${'A'.repeat(52)}…"`)).toBeInTheDocument();
  });
});
