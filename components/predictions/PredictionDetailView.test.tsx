import '@/test/mocks/use-topic-catalog';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { PredictionDetailView } from './PredictionDetailView';
import { buildPrediction } from '@/test/factories/prediction';
import { usePrediction } from '@/hooks/usePrediction';
import { usePredictions } from '@/hooks/usePredictions';
import { TIMELINE_FINISHED_LABEL } from '@/lib/lifecycle-copy';

vi.mock('@/hooks/usePrediction', () => ({
  usePrediction: vi.fn(),
}));

vi.mock('@/hooks/usePredictions', () => ({
  usePredictions: vi.fn(),
}));

vi.mock('@/services/api', () => ({
  updatePredictionOutcome: vi.fn(),
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

    expect(screen.getByText(TIMELINE_FINISHED_LABEL)).toBeInTheDocument();
    const time = screen.getByText('Jul 15, 2024');
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

    expect(screen.queryByText(TIMELINE_FINISHED_LABEL)).not.toBeInTheDocument();
  });
});
