import '@/test/mocks/use-topic-catalog';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { SourceDetailView } from './SourceDetailView';
import { buildPrediction } from '@/test/factories/prediction';
import { idlePredictionFeed } from '@/test/factories/hook-results';
import { usePredictionFeed } from '@/hooks/usePredictionFeed';
import { usePredictions } from '@/hooks/usePredictions';
import type { Prediction, PredictionFilters } from '@/types/prediction';

vi.mock('@/hooks/usePredictions', () => ({
  usePredictions: vi.fn(),
}));

vi.mock('@/hooks/usePredictionFeed', () => ({
  usePredictionFeed: vi.fn(),
}));

const mockUsePredictions = vi.mocked(usePredictions);
const mockUsePredictionFeed = vi.mocked(usePredictionFeed);

function mockStatsFetch(
  result: ReturnType<typeof usePredictions>,
) {
  mockUsePredictions.mockReturnValue(result);
}

function mockFeedFetch(
  result: Partial<ReturnType<typeof usePredictionFeed>> & {
    data?: Prediction[];
  } = {},
) {
  const { data = [], ...rest } = result;
  mockUsePredictionFeed.mockReturnValue(
    idlePredictionFeed({ data, ...rest }),
  );
}

function mockSourcePageFetches(
  allPredictions: Prediction[],
  feedOverrides: Partial<ReturnType<typeof usePredictionFeed>> = {},
) {
  mockStatsFetch({
    data: allPredictions,
    loading: false,
    error: null,
    refetch: vi.fn(),
  });
  mockFeedFetch({ data: allPredictions, ...feedOverrides });
}

function mockFeedByStatus(
  allPredictions: Prediction[],
  feedOverrides: Partial<ReturnType<typeof usePredictionFeed>> = {},
) {
  mockStatsFetch({
    data: allPredictions,
    loading: false,
    error: null,
    refetch: vi.fn(),
  });
  mockUsePredictionFeed.mockImplementation((filters: PredictionFilters) => {
    const data
      = filters.status === 'still_open'
        ? allPredictions.filter(p => p.outcome === 'still_open')
        : allPredictions;
    return idlePredictionFeed({ data, ...feedOverrides });
  });
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
    mockUsePredictionFeed.mockReset();
  });

  test('given loaded predictions, should render breadcrumb and serif title without slug', () => {
    mockSourcePageFetches([
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
    ]);

    render(<SourceDetailView sourceSlug="jane-analyst" />);

    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(within(nav).getByRole('link', { name: 'Home' })).toHaveAttribute(
      'href',
      '/',
    );
    expect(
      screen.getByRole('heading', { level: 1, name: 'Jane Analyst' }),
    ).toBeInTheDocument();
    const pageHeader = screen.getByRole('navigation', { name: 'Breadcrumb' }).closest('header');
    expect(pageHeader).not.toBeNull();
    expect(
      within(pageHeader!).getByLabelText(/source accuracy 50 percent/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/source slug/i)).not.toBeInTheDocument();
    expect(screen.queryByText('jane-analyst')).not.toBeInTheDocument();
  });

  test('given scored stats, should render sidebar with progressbar', () => {
    mockSourcePageFetches([
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
    ]);

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
    mockSourcePageFetches([
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
    ]);

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
    mockSourcePageFetches([]);

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

  test('given stats fetch error, should render stats alert and omit feed alert', () => {
    const refetchStats = vi.fn();

    mockStatsFetch({
      data: [],
      loading: false,
      error: 'Failed to load predictions',
      refetch: refetchStats,
    });
    mockFeedFetch();

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

  test('given snapshot at limit, should show 100+ total and capped disclosure', () => {
    const predictions = Array.from({ length: 100 }, (_, index) =>
      buildPrediction({
        id: `p-${index}`,
        source: 'Jane Analyst',
        sourceSlug: 'jane-analyst',
        outcome: 'still_open',
      }),
    );

    mockSourcePageFetches(predictions);

    render(<SourceDetailView sourceSlug="jane-analyst" />);

    const sidebar = screen.getByRole('complementary', {
      name: 'Source statistics',
    });
    expectSidebarStatValue(sidebar, 'Total predictions', '100+');
    expect(
      within(sidebar).getByText(/Counts use the first 100 predictions/i),
    ).toBeInTheDocument();
  });

  test('selecting still open should request paginated feed with still_open status', () => {
    mockFeedByStatus([
      buildPrediction({
        source: 'Jane Analyst',
        sourceSlug: 'jane-analyst',
        outcome: 'still_open',
      }),
    ]);

    render(<SourceDetailView sourceSlug="jane-analyst" />);

    fireEvent.click(screen.getByRole('radio', { name: 'Still open' }));

    expect(mockUsePredictionFeed).toHaveBeenLastCalledWith(
      { source: 'jane-analyst', status: 'still_open' },
      { pageSize: 20 },
    );
  });

  test('should request paginated feed separately from stats snapshot', () => {
    mockSourcePageFetches([
      buildPrediction({
        source: 'Jane Analyst',
        sourceSlug: 'jane-analyst',
      }),
    ]);

    render(<SourceDetailView sourceSlug="jane-analyst" />);

    expect(mockUsePredictions).toHaveBeenCalledWith({
      source: 'jane-analyst',
      status: 'all',
      limit: 100,
    });
    expect(mockUsePredictionFeed).toHaveBeenCalledWith(
      { source: 'jane-analyst', status: 'all' },
      { pageSize: 20 },
    );
  });

  test('given feed fetch error while filtered, should hide stale predictions', () => {
    const allPredictions = [
      buildPrediction({
        id: 'p-stale',
        source: 'Jane Analyst',
        sourceSlug: 'jane-analyst',
        text: 'Stale forecast text',
        outcome: 'still_open',
      }),
      buildPrediction({
        id: 'p-correct',
        source: 'Jane Analyst',
        sourceSlug: 'jane-analyst',
        outcome: 'correct',
        finished_at: '2024-06-01T00:00:00.000Z',
      }),
    ];

    mockStatsFetch({
      data: allPredictions,
      loading: false,
      error: null,
      refetch: vi.fn(),
    });
    mockUsePredictionFeed.mockImplementation((filters: PredictionFilters) => {
      if (filters.status === 'still_open') {
        return idlePredictionFeed({
          data: [allPredictions[0]!],
          error: 'Feed failed',
        });
      }
      return idlePredictionFeed({ data: allPredictions });
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

  test('given more feed rows available, should call loadMore when Load more is clicked', () => {
    const loadMore = vi.fn();
    mockSourcePageFetches(
      [
        buildPrediction({
          id: 'p-1',
          source: 'Jane Analyst',
          sourceSlug: 'jane-analyst',
        }),
      ],
      { hasMore: true, loadMore },
    );

    render(<SourceDetailView sourceSlug="jane-analyst" />);

    fireEvent.click(screen.getByRole('button', { name: 'Load more' }));
    expect(loadMore).toHaveBeenCalledOnce();
  });

  test('timeline links predictions to detail and omits inline scoring actions', () => {
    mockSourcePageFetches([
      buildPrediction({
        id: 'p-still-open',
        source: 'Jane Analyst',
        sourceSlug: 'jane-analyst',
        text: 'Open forecast text',
        outcome: 'still_open',
      }),
    ]);

    render(<SourceDetailView sourceSlug="jane-analyst" />);

    expect(
      screen.getByRole('link', { name: /open forecast text/i }),
    ).toHaveAttribute('href', '/predictions/p-still-open');
    expect(screen.queryByRole('button', { name: /mark correct/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /jane analyst/i })).not.toBeInTheDocument();
  });

  test('should render prediction feed heading and status filter', () => {
    mockSourcePageFetches([
      buildPrediction({
        source: 'Jane Analyst',
        sourceSlug: 'jane-analyst',
        outcome: 'still_open',
      }),
    ]);

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

    mockFeedByStatus(allPredictions);

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
    mockFeedByStatus([
      buildPrediction({
        source: 'Jane Analyst',
        sourceSlug: 'jane-analyst',
        outcome: 'correct',
        finished_at: '2024-06-01T00:00:00.000Z',
      }),
    ]);

    render(<SourceDetailView sourceSlug="jane-analyst" />);

    fireEvent.click(screen.getByRole('radio', { name: 'Still open' }));

    expect(
      screen.getByText('No still open forecasts for this source.'),
    ).toBeInTheDocument();
  });

  test('clear status filter should reset feed to all', () => {
    mockFeedByStatus([
      buildPrediction({
        id: 'p-correct',
        source: 'Jane Analyst',
        sourceSlug: 'jane-analyst',
        text: 'Closed forecast text',
        outcome: 'correct',
        finished_at: '2024-06-01T00:00:00.000Z',
      }),
    ]);

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
