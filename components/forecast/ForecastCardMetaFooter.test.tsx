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

function primaryFromIds(ids: string[]) {
  const linked = getTopicsByIds(ids);
  const curated = linked.find(t => t.kind === 'curated');
  if (curated) return curated;
  return linked.find(t => t.kind === 'bucket') ?? linked[0] ?? null;
}

function parentBucketsFromTopic(topic: { kind: string; parentTopicIds: string[] }) {
  if (topic.kind !== 'curated') return [];
  return getTopicsByIds(topic.parentTopicIds).filter(t => t.kind === 'bucket');
}

vi.mock('@/hooks/useTopicCatalog', () => ({
  useTopicCatalog: () => ({
    getTopicsByIds,
    getPrimaryTopicForPrediction: primaryFromIds,
    getParentBucketTopics: parentBucketsFromTopic,
  }),
}));

const TOPIC_AI = 'topic-ai-regulation-2026';
const TOPIC_HOUSING = 'topic-housing-market-2026';
const TOPIC_MIDTERM = 'topic-midterm-elections-2026';

describe('ForecastCardMetaFooter', () => {
  test('no topics', () => {
    render(<ForecastCardMetaFooter topicIds={[]} />);
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /browse/i })).not.toBeInTheDocument();
  });

  test('one curated topic shows parent bucket and curated label', () => {
    render(<ForecastCardMetaFooter topicIds={[TOPIC_MIDTERM]} />);
    expect(
      screen.getByRole('link', { name: 'Browse Politics forecasts' }),
    ).toHaveAttribute('href', '/topics/politics');
    expect(
      screen.getByRole('link', { name: 'Browse Midterm elections 2026 forecasts' }),
    ).toHaveAttribute('href', '/topics/midterm-elections-2026');
    expect(screen.queryByText('+1')).not.toBeInTheDocument();
  });

  test('one topic', () => {
    render(<ForecastCardMetaFooter topicIds={[TOPIC_AI]} />);
    expect(
      screen.getByRole('link', { name: 'Browse Tech forecasts' }),
    ).toHaveAttribute('href', '/topics/tech');
    const topicLink = screen.getByRole('link', { name: 'Browse AI regulation 2026 forecasts' });
    expect(topicLink).toHaveAttribute('href', '/topics/ai-regulation-2026');
    expect(screen.queryByText('+1')).not.toBeInTheDocument();
  });

  test('multiple topics', () => {
    render(
      <ForecastCardMetaFooter topicIds={[TOPIC_AI, TOPIC_HOUSING]} />,
    );
    expect(screen.getByRole('link', { name: 'Browse AI regulation 2026 forecasts' })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Browse Housing market 2026 forecasts' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('+1')).not.toBeInTheDocument();
  });

  test('unknown ids', () => {
    render(
      <ForecastCardMetaFooter
        topicIds={[TOPIC_AI, TOPIC_HOUSING, 'unknown-id']}
      />,
    );
    expect(screen.getByRole('link', { name: 'Browse AI regulation 2026 forecasts' })).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Browse Housing market 2026 forecasts' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Unknown topic' })).not.toBeInTheDocument();
  });
});
