import { render, screen, within } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { PredictionSourceSidebar } from './PredictionSourceSidebar';
import type { SourceAccuracyStats } from '@/lib/source-stats';

const stats: SourceAccuracyStats = {
  name: 'Alice',
  total: 12,
  stillOpen: 3,
  scored: 8,
  correct: 5,
  outcomeUnresolved: 1,
  invalid: 0,
  noLongerOpen: 9,
  accuracy: 62.5,
};

describe('PredictionSourceSidebar', () => {
  test('given loaded stats, should link to the source profile and show stats sidebar', () => {
    render(
      <PredictionSourceSidebar
        sourceName="Alice"
        sourceSlug="alice"
        stats={stats}
      />,
    );

    expect(
      screen.getByRole('link', { name: 'Full source profile' }),
    ).toHaveAttribute('href', '/source/alice');
    expect(screen.getAllByRole('link', { name: 'Alice' })[0]).toHaveAttribute(
      'href',
      '/source/alice',
    );

    const statsAside = screen.getByRole('complementary', {
      name: 'Source statistics',
    });
    expect(
      within(statsAside).getByText('Total predictions'),
    ).toBeInTheDocument();
  });

  test('given loading, should show profile skeleton without stats landmark', () => {
    render(
      <PredictionSourceSidebar
        sourceName="Alice"
        sourceSlug="alice"
        stats={stats}
        loading
      />,
    );

    expect(
      screen.getByLabelText('Source profile'),
    ).toHaveAttribute('aria-busy', 'true');
    expect(
      screen.queryByRole('complementary', { name: 'Source statistics' }),
    ).toBeNull();
  });
});
