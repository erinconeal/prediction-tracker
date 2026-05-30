import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import '@/test/mocks/use-topic-catalog';
import { ForecastCardMetaFooter } from './ForecastCardMetaFooter';

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
    ).toHaveAttribute('href', '/politics');
    expect(
      screen.getByRole('link', { name: 'Browse Midterm elections 2026 forecasts' }),
    ).toHaveAttribute('href', '/midterm-elections-2026');
    expect(screen.queryByText('+1')).not.toBeInTheDocument();
  });

  test('one topic', () => {
    render(<ForecastCardMetaFooter topicIds={[TOPIC_AI]} />);
    expect(
      screen.getByRole('link', { name: 'Browse Tech forecasts' }),
    ).toHaveAttribute('href', '/tech');
    const topicLink = screen.getByRole('link', { name: 'Browse AI regulation 2026 forecasts' });
    expect(topicLink).toHaveAttribute('href', '/ai-regulation-2026');
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
