import '@/test/mocks/use-topic-catalog';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { SourceDetailView } from './SourceDetailView';
import { buildPrediction } from '@/test/factories/prediction';
import { usePredictions } from '@/hooks/usePredictions';

vi.mock('@/hooks/usePredictions', () => ({
  usePredictions: vi.fn(),
}));

const mockUsePredictions = vi.mocked(usePredictions);

describe('SourceDetailView', () => {
  beforeEach(() => {
    mockUsePredictions.mockReset();
  });

  test('given loaded predictions, should render breadcrumb and serif title without slug', () => {
    mockUsePredictions.mockReturnValue({
      data: [
        buildPrediction({
          source: 'Jane Analyst',
          sourceSlug: 'jane-analyst',
          outcome: 'correct',
          finished_at: '2024-06-01T00:00:00.000Z',
        }),
        buildPrediction({
          id: 'p-2',
          source: 'Jane Analyst',
          sourceSlug: 'jane-analyst',
          outcome: 'incorrect',
          finished_at: '2024-06-02T00:00:00.000Z',
        }),
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<SourceDetailView sourceSlug="jane-analyst" />);

    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(within(nav).getByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/',
    );
    expect(
      screen.getByRole('heading', { level: 1, name: 'Jane Analyst' }),
    ).toHaveClass('font-serif');
    expect(screen.queryByText(/source slug/i)).not.toBeInTheDocument();
    expect(screen.queryByText('jane-analyst')).not.toBeInTheDocument();
  });

  test('given scored stats, should render sidebar with progressbar', () => {
    mockUsePredictions.mockReturnValue({
      data: [
        buildPrediction({
          source: 'Jane Analyst',
          sourceSlug: 'jane-analyst',
          outcome: 'correct',
          finished_at: '2024-06-01T00:00:00.000Z',
        }),
        buildPrediction({
          id: 'p-2',
          source: 'Jane Analyst',
          sourceSlug: 'jane-analyst',
          outcome: 'incorrect',
          finished_at: '2024-06-02T00:00:00.000Z',
        }),
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<SourceDetailView sourceSlug="jane-analyst" />);

    const sidebar = screen.getByRole('complementary', { name: 'Source statistics' });
    expect(within(sidebar).getByText('Total predictions')).toBeInTheDocument();
    expect(within(sidebar).getByText('No longer open')).toBeInTheDocument();
    expect(within(sidebar).getByRole('progressbar')).toBeInTheDocument();
    expect(
      within(sidebar).getByRole('link', { name: 'How we score' }),
    ).toHaveAttribute('href', '/about#lifecycle-language');
  });

  test('given empty predictions, should humanize slug for title and omit progressbar', () => {
    mockUsePredictions.mockReturnValue({
      data: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<SourceDetailView sourceSlug="jane-analyst" />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Jane Analyst' }),
    ).toBeInTheDocument();
    const sidebar = screen.getByRole('complementary', { name: 'Source statistics' });
    expect(within(sidebar).queryByRole('progressbar')).not.toBeInTheDocument();
    expect(
      screen.getByText('No forecasts recorded for this source yet.'),
    ).toBeInTheDocument();
  });

  test('given fetch error, should render alert with retry', () => {
    const refetch = vi.fn();

    mockUsePredictions.mockReturnValue({
      data: [],
      loading: false,
      error: 'Failed to load predictions',
      refetch,
    });

    render(<SourceDetailView sourceSlug="jane-analyst" />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Failed to load predictions');
    fireEvent.click(within(alert).getByRole('button', { name: 'Retry' }));
    expect(refetch).toHaveBeenCalledOnce();
  });

  test('timeline links predictions to detail and omits inline scoring actions', () => {
    mockUsePredictions.mockReturnValue({
      data: [
        buildPrediction({
          id: 'p-still-open',
          source: 'Jane Analyst',
          sourceSlug: 'jane-analyst',
          text: 'Open forecast text',
          outcome: 'still_open',
        }),
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<SourceDetailView sourceSlug="jane-analyst" />);

    expect(
      screen.getByRole('link', { name: /open forecast text/i }),
    ).toHaveAttribute('href', '/predictions/p-still-open');
    expect(screen.queryByRole('button', { name: /mark correct/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /jane analyst/i })).not.toBeInTheDocument();
  });
});
