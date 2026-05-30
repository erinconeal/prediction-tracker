import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { getTopicBySlug } from '@/lib/topic-store';
import { ForecastTopicLink } from './ForecastTopicLink';

describe('ForecastTopicLink', () => {
  test('given a topic, should link to the topic feed with browse label', () => {
    const topic = getTopicBySlug('finance');
    expect(topic).toBeDefined();

    render(<ForecastTopicLink topic={topic} />);

    const link = screen.getByRole('link', {
      name: 'Browse Finance forecasts',
    });
    expect(link).toHaveAttribute('href', '/finance');
    expect(link).toHaveTextContent('Finance');
  });

  test('given no topic, should render static general label', () => {
    render(<ForecastTopicLink topic={null} />);

    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
