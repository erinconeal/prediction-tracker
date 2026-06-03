import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { RecentlyJudgedWidget } from './RecentlyJudgedWidget';
import { buildPrediction } from '@/test/factories/prediction';
import {
  WIDGET_RECENTLY_JUDGED,
  WIDGET_RECENTLY_JUDGED_EMPTY,
} from '@/lib/lifecycle-copy';

vi.mock('@/utils/format-date', () => ({
  formatFinishedRelativeTime: () => '2h ago',
}));

describe('RecentlyJudgedWidget', () => {
  test('given scored items, should show heading, quoted excerpts, source, and links', () => {
    render(
      <RecentlyJudgedWidget
        items={[
          {
            prediction: buildPrediction({
              id: 'p-correct',
              source: 'Alice',
              text: 'Q2 GDP will exceed expectations by 0.5%',
              outcome: 'correct',
              finished_at: '2026-05-31T12:00:00.000Z',
            }),
            finishedAt: '2026-05-31T12:00:00.000Z',
          },
          {
            prediction: buildPrediction({
              id: 'p-incorrect',
              source: 'Bob',
              text: 'New tech IPO will list at $45/share minimum',
              outcome: 'incorrect',
              finished_at: '2026-05-31T09:00:00.000Z',
            }),
            finishedAt: '2026-05-31T09:00:00.000Z',
          },
        ]}
      />,
    );

    expect(
      screen.getByRole('heading', { name: WIDGET_RECENTLY_JUDGED }),
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
    expect(correctLink).toHaveTextContent('2h ago');
    expect(correctLink).not.toHaveTextContent('Resolved');
    expect(correctLink).toHaveTextContent('Correct');
    expect(incorrectLink).toHaveTextContent('Bob');
    expect(incorrectLink).toHaveTextContent('2h ago');
    expect(incorrectLink).toHaveTextContent('Incorrect');
    expect(correctLink).toHaveAttribute('href', '/predictions/p-correct');
    expect(incorrectLink).toHaveAttribute('href', '/predictions/p-incorrect');
  });

  test('given no items, should show empty state', () => {
    render(<RecentlyJudgedWidget items={[]} />);

    expect(screen.getByText(WIDGET_RECENTLY_JUDGED_EMPTY)).toBeInTheDocument();
  });

  test('given long prediction text, should truncate quoted excerpt', () => {
    const longText = 'A'.repeat(60);

    render(
      <RecentlyJudgedWidget
        items={[
          {
            prediction: buildPrediction({
              id: 'p-long',
              text: longText,
              outcome: 'correct',
              finished_at: '2026-05-31T12:00:00.000Z',
            }),
            finishedAt: '2026-05-31T12:00:00.000Z',
          },
        ]}
      />,
    );

    expect(screen.getByText(`"${'A'.repeat(52)}…"`)).toBeInTheDocument();
  });
});
