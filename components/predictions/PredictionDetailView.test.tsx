import '@/test/mocks/use-topic-catalog';
import { render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { PredictionDetailView } from './PredictionDetailView';
import { buildPrediction } from '@/test/factories/prediction';
import { usePrediction } from '@/hooks/usePrediction';
import { usePredictions } from '@/hooks/usePredictions';
import {
  TIMELINE_FINISHED_LABEL,
  TIMELINE_SUBMITTED_LABEL,
} from '@/lib/lifecycle-copy';

vi.mock('@/hooks/usePrediction', () => ({
  usePrediction: vi.fn(),
}));

vi.mock('@/hooks/usePredictions', () => ({
  usePredictions: vi.fn(),
}));

const mockUsePrediction = vi.mocked(usePrediction);
const mockUsePredictions = vi.mocked(usePredictions);

describe('PredictionDetailView', () => {
  beforeEach(() => {
    mockUsePredictions.mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  test('given a loaded prediction, should show breadcrumb with current page', () => {
    mockUsePrediction.mockReturnValue({
      prediction: buildPrediction({
        id: 'p-breadcrumb',
        text: 'Rates will fall this year',
      }),
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<PredictionDetailView id="p-breadcrumb" />);

    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(within(nav).getByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/',
    );
    expect(within(nav).getByRole('listitem', { current: 'page' })).toHaveTextContent(
      'Rates will fall this year',
    );
  });

  test('given loaded source stats, should show source profile sidebar and not main-column stats grid', () => {
    mockUsePrediction.mockReturnValue({
      prediction: buildPrediction({
        id: 'p-sidebar',
        source: 'Alice',
        sourceSlug: 'alice',
        text: 'It will rain tomorrow',
      }),
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    mockUsePredictions.mockReturnValue({
      data: [buildPrediction({ source: 'Alice', sourceSlug: 'alice' })],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<PredictionDetailView id="p-sidebar" />);

    const statsAside = screen.getByRole('complementary', {
      name: 'Source statistics',
    });
    expect(
      within(statsAside).getByText('Total predictions'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Full source profile' }),
    ).toHaveAttribute('href', '/source/alice');
    expect(screen.queryByRole('heading', { name: 'Source stats' })).toBeNull();
  });

  test('given header metrics, should show submitted date in the header card', () => {
    mockUsePrediction.mockReturnValue({
      prediction: buildPrediction({
        id: 'p-metrics',
        text: 'Rates will fall',
        created_at: '2024-01-15T00:00:00.000Z',
      }),
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<PredictionDetailView id="p-metrics" />);

    const metrics = screen.getByLabelText('Prediction dates');
    expect(
      within(metrics).getByText(TIMELINE_SUBMITTED_LABEL),
    ).toBeInTheDocument();
    expect(within(metrics).getByText('Jan 15, 2024')).toBeInTheDocument();
    const submittedTime = within(metrics).getByText('Jan 15, 2024');
    expect(submittedTime.tagName).toBe('TIME');
    expect(submittedTime).toHaveAttribute('datetime', '2024-01-15T00:00:00.000Z');
  });

  test('given loaded prediction id differs from route id, should not move focus to the page heading', () => {
    mockUsePrediction.mockReturnValue({
      prediction: buildPrediction({
        id: 'stale-id',
        text: 'Rates will fall this year',
      }),
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<PredictionDetailView id="p-focus" />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Rates will fall this year' }),
    ).not.toHaveFocus();
  });

  test('given a loaded prediction, should move focus to the page heading', () => {
    mockUsePrediction.mockReturnValue({
      prediction: buildPrediction({
        id: 'p-focus',
        text: 'Rates will fall this year',
      }),
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<PredictionDetailView id="p-focus" />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Rates will fall this year' }),
    ).toHaveFocus();
  });

  test('given a terminal prediction with finished_at, should show Finished in the timeline', () => {
    mockUsePrediction.mockReturnValue({
      prediction: buildPrediction({
        id: 'p-finished',
        text: 'Rates will fall this year',
        outcome: 'correct',
        finished_at: '2024-07-15T00:00:00.000Z',
      }),
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<PredictionDetailView id="p-finished" />);

    const timeline = screen.getByRole('region', { name: 'Timeline' });
    expect(
      within(timeline).getByText(TIMELINE_FINISHED_LABEL),
    ).toBeInTheDocument();
    const time = within(timeline).getByText('Jul 15, 2024');
    expect(time.tagName).toBe('TIME');
    expect(time).toHaveAttribute('datetime', '2024-07-15T00:00:00.000Z');
  });

  test('given a still-open prediction, should not show Finished in the timeline', () => {
    mockUsePrediction.mockReturnValue({
      prediction: buildPrediction({
        id: 'p-open',
        text: 'Rates will fall this year',
        outcome: 'still_open',
        finished_at: null,
      }),
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<PredictionDetailView id="p-open" />);

    const timeline = screen.getByRole('region', { name: 'Timeline' });
    expect(
      within(timeline).queryByText(TIMELINE_FINISHED_LABEL),
    ).not.toBeInTheDocument();
  });

  test('given a still-open prediction, should not show outcome record controls', () => {
    mockUsePrediction.mockReturnValue({
      prediction: buildPrediction({
        id: 'p-open-no-actions',
        text: 'Rates will fall this year',
        outcome: 'still_open',
      }),
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<PredictionDetailView id="p-open-no-actions" />);

    expect(
      screen.queryByRole('button', { name: /Mark correct/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /Mark incorrect/i }),
    ).not.toBeInTheDocument();
  });
});
