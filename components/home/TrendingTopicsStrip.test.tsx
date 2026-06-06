import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { buildTopic } from '@/test/factories/topic';
import { TrendingTopicsStrip } from './TrendingTopicsStrip';

const topic = (slug: string, name: string) =>
  buildTopic({
    id: `id-${slug}`,
    slug,
    name,
    kind: 'curated',
  });

describe('TrendingTopicsStrip', () => {
  test('renders topic links', () => {
    render(
      <TrendingTopicsStrip
        topics={[
          { topic: topic('ai-regulation-2026', 'AI regulation 2026'), count: 5, recentCount: 2 },
          { topic: topic('sp-hits-8000', 'S&P hits 8000'), count: 3, recentCount: 1 },
        ]}
      />,
    );

    expect(screen.getByRole('heading', { name: /trending topics/i })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /ai regulation 2026/i }),
    ).toHaveAttribute('href', '/ai-regulation-2026');
  });

  test('given ranked topics, should mark only the lead topic as trending', () => {
    render(
      <TrendingTopicsStrip
        topics={[
          { topic: topic('ai-regulation-2026', 'AI regulation 2026'), count: 5, recentCount: 2 },
          { topic: topic('sp-hits-8000', 'S&P hits 8000'), count: 3, recentCount: 1 },
        ]}
      />,
    );

    expect(
      screen.getByRole('link', { name: /ai regulation 2026.*trending topic/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /s&p hits 8000.*trending topic/i }),
    ).not.toBeInTheDocument();
  });

  test('hides when empty and not loading', () => {
    render(<TrendingTopicsStrip topics={[]} />);
    expect(
      screen.queryByRole('navigation', { name: /trending topics/i }),
    ).not.toBeInTheDocument();
  });

  test('shows scroll affordance when topics overflow', async () => {
    const manyTopics = Array.from({ length: 12 }, (_, i) => ({
      topic: topic(`topic-${i}`, `Topic ${i}`),
      count: 1,
      recentCount: 0,
    }));

    render(<TrendingTopicsStrip topics={manyTopics} embedded />);

    const list = screen.getByRole('list');

    Object.defineProperty(list, 'clientWidth', { value: 200, configurable: true });
    Object.defineProperty(list, 'scrollWidth', { value: 800, configurable: true });
    Object.defineProperty(list, 'scrollLeft', {
      value: 0,
      writable: true,
      configurable: true,
    });

    fireEvent.scroll(list);

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /show more trending topics/i }),
      ).toBeInTheDocument();
    });
  });
});
