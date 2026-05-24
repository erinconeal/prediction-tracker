import type { ReactNode } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { getTopicsByIds } from '@/lib/topic-store';
import { ForecastCardMetaFooter } from './ForecastCardMetaFooter';

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

vi.mock('@/hooks/useTopicCatalog', () => ({
  useTopicCatalog: () => ({
    getTopicsByIds,
  }),
}));

const TOPIC_AI = 'topic-ai-regulation-2026';
const TOPIC_HOUSING = 'topic-housing-market-2026';

describe('ForecastCardMetaFooter', () => {
  test('no topics', () => {
    render(<ForecastCardMetaFooter category="Finance" />);
    expect(screen.getByText('Finance')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Browse Finance forecasts' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'AI regulation 2026' })).not.toBeInTheDocument();
  });

  test('one topic', () => {
    render(<ForecastCardMetaFooter category="Finance" topicIds={[TOPIC_AI]} />);
    expect(screen.getByText('Finance')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Browse Finance forecasts' })).toBeInTheDocument();
    const topicLink = screen.getByRole('link', { name: 'AI regulation 2026' });
    expect(topicLink).toHaveAttribute('href', '/topics/ai-regulation-2026');
    expect(screen.queryByText('+1')).not.toBeInTheDocument();
  });

  test('multiple topics', () => {
    render(
      <ForecastCardMetaFooter category="Finance" topicIds={[TOPIC_AI, TOPIC_HOUSING]} />,
    );
    expect(screen.getByText('Finance')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Browse Finance forecasts' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'AI regulation 2026' })).toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Housing market 2026' })).not.toBeInTheDocument();
  });

  test('unknown ids', () => {
    render(
      <ForecastCardMetaFooter
        category="Finance"
        topicIds={[TOPIC_AI, TOPIC_HOUSING, 'unknown-id']}
      />,
    );
    expect(screen.getByText('Finance')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Browse Finance forecasts' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'AI regulation 2026' })).toBeInTheDocument();
    expect(screen.getByText('+1')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Unknown topic' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Housing market 2026' })).not.toBeInTheDocument();
  });
});
