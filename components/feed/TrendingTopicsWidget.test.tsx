import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { TrendingTopicsWidget } from './TrendingTopicsWidget';

describe('TrendingTopicsWidget', () => {
  test('renders compact topic counts in badge styling', () => {
    render(
      <TrendingTopicsWidget
        topics={[
          {
            id: 'topic-economy',
            slug: 'economy',
            name: 'Economy',
            kind: 'curated',
            parentTopicIds: ['topic-politics'],
            count: 10_499,
            recentCount: 3,
          },
        ]}
      />,
    );

    expect(screen.getByRole('link', { name: /Economy 10\.5k/i })).toBeInTheDocument();
  });
});
