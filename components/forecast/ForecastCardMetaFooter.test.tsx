import '@/test/mocks/use-topic-catalog';
import { beforeEach, describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  resetTopicCatalogMockForTests,
  topicCatalogMockValue,
} from '@/test/mocks/use-topic-catalog';
import { ForecastCardMetaFooter } from './ForecastCardMetaFooter';

const TOPIC_AI = 'topic-ai-regulation-2026';
const TOPIC_HOUSING = 'topic-housing-market-2026';
const TOPIC_MIDTERM = 'topic-midterm-elections-2026';

describe('ForecastCardMetaFooter', () => {
  beforeEach(() => {
    resetTopicCatalogMockForTests();
  });

  test('no topics', async () => {
    render(<ForecastCardMetaFooter topicIds={[]} />);
    expect(await screen.findByText('General')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /browse/i })).not.toBeInTheDocument();
  });

  test('given topic ids while catalog is loading, should not show generic empty topic label', () => {
    topicCatalogMockValue.loading = true;
    topicCatalogMockValue.topics = [];

    render(<ForecastCardMetaFooter topicIds={[TOPIC_AI]} />);

    expect(screen.queryByText('General')).not.toBeInTheDocument();
  });

  test('one curated topic shows parent bucket and curated label', async () => {
    render(<ForecastCardMetaFooter topicIds={[TOPIC_MIDTERM]} />);
    expect(
      await screen.findByRole('link', { name: 'Browse Politics forecasts' }),
    ).toHaveAttribute('href', '/politics');
    expect(
      screen.getByRole('link', { name: 'Browse Midterm elections 2026 forecasts' }),
    ).toHaveAttribute('href', '/midterm-elections-2026');
    expect(screen.queryByText('+1')).not.toBeInTheDocument();
  });

  test('one topic', async () => {
    render(<ForecastCardMetaFooter topicIds={[TOPIC_AI]} />);
    expect(
      await screen.findByRole('link', { name: 'Browse Tech forecasts' }),
    ).toHaveAttribute('href', '/tech');
    const topicLink = screen.getByRole('link', { name: 'Browse AI regulation 2026 forecasts' });
    expect(topicLink).toHaveAttribute('href', '/ai-regulation-2026');
    expect(screen.queryByText('+1')).not.toBeInTheDocument();
  });

  test('multiple topics', async () => {
    render(
      <ForecastCardMetaFooter topicIds={[TOPIC_AI, TOPIC_HOUSING]} />,
    );
    expect(
      await screen.findByRole('link', { name: 'Browse AI regulation 2026 forecasts' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Browse Housing market 2026 forecasts' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('+1')).not.toBeInTheDocument();
  });

  test('unknown ids', async () => {
    render(
      <ForecastCardMetaFooter
        topicIds={[TOPIC_AI, TOPIC_HOUSING, 'unknown-id']}
      />,
    );
    expect(
      await screen.findByRole('link', { name: 'Browse AI regulation 2026 forecasts' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Browse Housing market 2026 forecasts' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Unknown topic' })).not.toBeInTheDocument();
  });
});
