import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { buildPredictionWithId } from '@/test/factories/prediction';
import { PopularForecastsSection } from './PopularForecastsSection';

describe('PopularForecastsSection', () => {
  test('given loaded forecasts, should use Featured forecasts as section title', () => {
    render(
      <PopularForecastsSection
        predictions={[buildPredictionWithId('a', {
          topicIds: ['topic-tech'],
          created_at: '2024-06-01T00:00:00.000Z',
        })]}
        statsContext={[buildPredictionWithId('a', {
          topicIds: ['topic-tech'],
          created_at: '2024-06-01T00:00:00.000Z',
        })]}
        slotCount={4}
      />,
    );

    expect(
      screen.getByRole('heading', { level: 2, name: 'Featured forecasts' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Popular forecasts' }),
    ).not.toBeInTheDocument();
  });

  test('given more predictions than slots, should render only one row', () => {
    render(
      <PopularForecastsSection
        predictions={[
          buildPredictionWithId('a', {
            topicIds: ['topic-tech'],
            created_at: '2024-06-01T00:00:00.000Z',
          }),
          buildPredictionWithId('b', {
            topicIds: ['topic-tech'],
            created_at: '2024-06-01T00:00:00.000Z',
          }),
          buildPredictionWithId('c', {
            topicIds: ['topic-tech'],
            created_at: '2024-06-01T00:00:00.000Z',
          }),
          buildPredictionWithId('d', {
            topicIds: ['topic-tech'],
            created_at: '2024-06-01T00:00:00.000Z',
          }),
        ]}
        statsContext={[buildPredictionWithId('a', {
          topicIds: ['topic-tech'],
          created_at: '2024-06-01T00:00:00.000Z',
        })]}
        slotCount={2}
      />,
    );

    expect(screen.getAllByRole('article')).toHaveLength(2);
  });

  test('given loading, should expose busy state for featured forecasts', () => {
    render(
      <PopularForecastsSection
        predictions={[]}
        statsContext={[]}
        slotCount={3}
        loading
      />,
    );

    expect(screen.getByLabelText('Loading featured forecasts')).toHaveAttribute(
      'aria-busy',
      'true',
    );
  });
});
