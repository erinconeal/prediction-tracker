import '@/test/mocks/use-topic-catalog';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { SourceDetailView } from './SourceDetailView';
import { buildPrediction } from '@/test/factories/prediction';
import { usePredictions } from '@/hooks/usePredictions';
import type { PredictionFilters } from '@/types/prediction';

vi.mock('@/hooks/usePredictions', () => ({
  usePredictions: vi.fn(),
}));

const mockUsePredictions = vi.mocked(usePredictions);

function mockPredictionsForFilters(
  resolver: (
    filters: PredictionFilters,
    options?: { enabled?: boolean },
  ) => ReturnType<typeof usePredictions>,
) {
  mockUsePredictions.mockImplementation((filters, options) =>
    resolver(filters, options),
  );
}

function mockSamePredictionsForAllFilters(
  result: ReturnType<typeof usePredictions>,
) {
  mockUsePredictions.mockImplementation(() => result);
}

function expectSidebarStatValue(
  sidebar: HTMLElement,
  label: string,
  value: number | string,
) {
  const labelEl = within(sidebar).getByText(label);
  const card = labelEl.closest('.rounded-xl');
  expect(card).not.toBeNull();
  expect(within(card as HTMLElement).getByText(String(value))).toBeInTheDocument();
}

describe('SourceDetailView', () => {
  beforeEach(() => {
    mockUsePredictions.mockReset();
  });

  test('given loaded predictions, should render breadcrumb and serif title without slug', () => {
    mockSamePredictionsForAllFilters({
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
    const pageHeader = screen.getByRole('navigation', { name: 'Breadcrumb' }).closest('header');
    expect(pageHeader).not.toBeNull();
    expect(
      within(pageHeader!).getByLabelText(/source accuracy 50 percent/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/source slug/i)).not.toBeInTheDocument();
    expect(screen.queryByText('jane-analyst')).not.toBeInTheDocument();
  });

  test('given scored stats, should render sidebar with progressbar', () => {
    mockSamePredictionsForAllFilters({
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
    expect(within(sidebar).getByText('Still open')).toBeInTheDocument();
    expect(within(sidebar).getByText('No longer open')).toBeInTheDocument();
    expect(within(sidebar).getByRole('progressbar')).toBeInTheDocument();
    expect(
      within(sidebar).getByRole('link', { name: 'How we score' }),
    ).toHaveAttribute('href', '/about#lifecycle-language');
  });

  test('given mixed outcomes, should show numeric sidebar lifecycle counts', () => {
    mockSamePredictionsForAllFilters({
      data: [
        buildPrediction({
          id: 'p-correct',
          source: 'Jane Analyst',
          sourceSlug: 'jane-analyst',
          outcome: 'correct',
          finished_at: '2024-06-01T00:00:00.000Z',
        }),
        buildPrediction({
          id: 'p-incorrect',
          source: 'Jane Analyst',
          sourceSlug: 'jane-analyst',
          outcome: 'incorrect',
          finished_at: '2024-06-02T00:00:00.000Z',
        }),
        buildPrediction({
          id: 'p-open',
          source: 'Jane Analyst',
          sourceSlug: 'jane-analyst',
          outcome: 'still_open',
        }),
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<SourceDetailView sourceSlug="jane-analyst" />);

    const sidebar = screen.getByRole('complementary', { name: 'Source statistics' });
    expectSidebarStatValue(sidebar, 'Total predictions', 3);
    expectSidebarStatValue(sidebar, 'Still open', 1);
    expectSidebarStatValue(sidebar, 'No longer open', 2);
    expect(
      within(sidebar).getByText(/2 scored \(correct \+ incorrect\)/i),
    ).toBeInTheDocument();
    expect(within(sidebar).getByText(/1 still open/i)).toBeInTheDocument();
    expect(within(sidebar).getByRole('progressbar')).toHaveAttribute(
      'aria-label',
      'Accuracy 50%',
    );
  });

  test('given empty predictions, should humanize slug for title and omit progressbar', () => {
    mockSamePredictionsForAllFilters({
      data: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<SourceDetailView sourceSlug="jane-analyst" />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Jane Analyst' }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/source accuracy unavailable/i),
    ).toBeInTheDocument();
    const sidebar = screen.getByRole('complementary', { name: 'Source statistics' });
    expect(within(sidebar).queryByRole('progressbar')).not.toBeInTheDocument();
    expect(
      screen.getByText('No forecasts recorded for this source yet.'),
    ).toBeInTheDocument();
  });

  test('given stats fetch error with all filter, should render stats alert and omit feed alert', () => {
    const refetchStats = vi.fn();

    mockPredictionsForFilters((filters, options) => {
      if (options?.enabled === false) {
        return {
          data: [],
          loading: false,
          error: null,
          refetch: vi.fn(),
        };
      }
      return {
        data: [],
        loading: false,
        error: 'Failed to load predictions',
        refetch: refetchStats,
      };
    });

    render(<SourceDetailView sourceSlug="jane-analyst" />);

    const feedSection = screen
      .getByRole('heading', { name: 'Prediction feed' })
      .closest('section');
    expect(feedSection).not.toBeNull();
    expect(
      within(feedSection as HTMLElement).queryByRole('alert'),
    ).not.toBeInTheDocument();

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Failed to load predictions');
    fireEvent.click(within(alert).getByRole('button', { name: 'Retry' }));
    expect(refetchStats).toHaveBeenCalledOnce();
  });

  test('given all filter, should disable secondary predictions fetch', () => {
    mockSamePredictionsForAllFilters({
      data: [
        buildPrediction({
          source: 'Jane Analyst',
          sourceSlug: 'jane-analyst',
        }),
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<SourceDetailView sourceSlug="jane-analyst" />);

    expect(mockUsePredictions).toHaveBeenCalledWith(
      { source: 'jane-analyst', status: 'all', limit: 100 },
      { enabled: false },
    );
  });

  test('given feed fetch error while filtered, should hide stale predictions', () => {
    mockPredictionsForFilters((filters) => {
      if (filters.status === 'still_open') {
        return {
          data: [
            buildPrediction({
              id: 'p-stale',
              source: 'Jane Analyst',
              sourceSlug: 'jane-analyst',
              text: 'Stale forecast text',
              outcome: 'still_open',
            }),
          ],
          loading: false,
          error: 'Feed failed',
          refetch: vi.fn(),
        };
      }
      return {
        data: [
          buildPrediction({
            source: 'Jane Analyst',
            sourceSlug: 'jane-analyst',
            outcome: 'still_open',
          }),
        ],
        loading: false,
        error: null,
        refetch: vi.fn(),
      };
    });

    render(<SourceDetailView sourceSlug="jane-analyst" />);

    fireEvent.click(screen.getByRole('radio', { name: 'Still open' }));

    expect(
      screen.queryByRole('link', { name: /stale forecast text/i }),
    ).not.toBeInTheDocument();
    const feedSection = screen
      .getByRole('heading', { name: 'Prediction feed' })
      .closest('section');
    expect(
      within(feedSection as HTMLElement).getByRole('alert'),
    ).toHaveTextContent('Feed failed');
  });

  test('timeline links predictions to detail and omits inline scoring actions', () => {
    mockSamePredictionsForAllFilters({
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

  test('should render prediction feed heading and status filter', () => {
    mockSamePredictionsForAllFilters({
      data: [
        buildPrediction({
          source: 'Jane Analyst',
          sourceSlug: 'jane-analyst',
          outcome: 'still_open',
        }),
      ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<SourceDetailView sourceSlug="jane-analyst" />);

    expect(
      screen.getByRole('heading', { level: 2, name: 'Prediction feed' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'All' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Still open' })).not.toBeChecked();
  });

  test('given still open filter, should show filtered feed and unchanged sidebar totals', () => {
    const allPredictions = [
      buildPrediction({
        id: 'p-open',
        source: 'Jane Analyst',
        sourceSlug: 'jane-analyst',
        text: 'Open forecast text',
        outcome: 'still_open',
      }),
      buildPrediction({
        id: 'p-correct',
        source: 'Jane Analyst',
        sourceSlug: 'jane-analyst',
        text: 'Closed forecast text',
        outcome: 'correct',
        finished_at: '2024-06-01T00:00:00.000Z',
      }),
    ];

    mockPredictionsForFilters((filters) => {
      const data
        = filters.status === 'still_open'
          ? allPredictions.filter(p => p.outcome === 'still_open')
          : allPredictions;
      return {
        data,
        loading: false,
        error: null,
        refetch: vi.fn(),
      };
    });

    render(<SourceDetailView sourceSlug="jane-analyst" />);

    fireEvent.click(screen.getByRole('radio', { name: 'Still open' }));

    expect(screen.getByRole('status')).toHaveTextContent('Showing: Still open');
    expect(
      screen.getByRole('link', { name: /open forecast text/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: /closed forecast text/i }),
    ).not.toBeInTheDocument();

    const sidebar = screen.getByRole('complementary', { name: 'Source statistics' });
    expectSidebarStatValue(sidebar, 'Total predictions', 2);
    expectSidebarStatValue(sidebar, 'Still open', 1);
  });

  test('given still open filter with no matches, should show still-open empty copy', () => {
    mockPredictionsForFilters(filters => ({
      data:
        filters.status === 'still_open'
          ? []
          : [
              buildPrediction({
                source: 'Jane Analyst',
                sourceSlug: 'jane-analyst',
                outcome: 'correct',
                finished_at: '2024-06-01T00:00:00.000Z',
              }),
            ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    }));

    render(<SourceDetailView sourceSlug="jane-analyst" />);

    fireEvent.click(screen.getByRole('radio', { name: 'Still open' }));

    expect(
      screen.getByText('No still open forecasts for this source.'),
    ).toBeInTheDocument();
  });

  test('clear status filter should reset feed to all', () => {
    mockPredictionsForFilters(filters => ({
      data:
        filters.status === 'still_open'
          ? []
          : [
              buildPrediction({
                id: 'p-correct',
                source: 'Jane Analyst',
                sourceSlug: 'jane-analyst',
                text: 'Closed forecast text',
                outcome: 'correct',
                finished_at: '2024-06-01T00:00:00.000Z',
              }),
            ],
      loading: false,
      error: null,
      refetch: vi.fn(),
    }));

    render(<SourceDetailView sourceSlug="jane-analyst" />);

    fireEvent.click(screen.getByRole('radio', { name: 'Still open' }));
    fireEvent.click(screen.getByRole('button', { name: 'Clear status filter' }));

    expect(screen.getByRole('radio', { name: 'All' })).toBeChecked();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /closed forecast text/i }),
    ).toBeInTheDocument();
  });
});
