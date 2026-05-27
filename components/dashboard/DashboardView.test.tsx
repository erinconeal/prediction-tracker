import type { ReactNode } from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { Prediction } from '@/types/prediction';
import * as api from '@/services/api';
import type { PredictionFilters } from '@/types/prediction';
import { DashboardView } from './DashboardView';

const mockReplace = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: mockReplace }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => '/',
}));

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

vi.mock('@/services/api', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/services/api')>();
  return {
    ...mod,
    listPredictions: vi.fn(),
    listLeaderboard: vi.fn(),
    listTopics: vi.fn(),
  };
});

const listTopics = vi.mocked(api.listTopics);

const listPredictions = vi.mocked(api.listPredictions);
const listLeaderboard = vi.mocked(api.listLeaderboard);

function row(i: number): Prediction {
  return {
    id: `id-${i}`,
    source: 'Source',
    sourceSlug: 'source',
    text: `Prediction ${i}`,
    topicIds: [],
    created_at: '2024-01-01T00:00:00.000Z',
    resolved_at: null,
    target_date: null,
    outcome: 'pending',
  };
}

const leaderboardRow = {
  rank: 1,
  source: 'Source',
  sourceSlug: 'source',
  total: 1,
  resolved: 0,
  scored: 0,
  correct: 0,
  accuracyPercent: null as number | null,
  pending: 1,
  outcomeUnresolved: 0,
  invalid: 0,
  streakKind: null as 'correct' | 'incorrect' | null,
  streakLength: 0,
};

function outcomeFilterInBrowseCard(predictionTitle: RegExp, outcomeLabel: string) {
  const browseSection = screen
    .getByRole('heading', { name: /browse forecasts/i })
    .closest('section');
  expect(browseSection).toBeTruthy();
  const titleLink = within(browseSection!).getByRole('link', {
    name: predictionTitle,
  });
  const card = titleLink.closest('article');
  expect(card).toBeTruthy();
  return within(card!).getByRole('button', {
    name: new RegExp(`filter browse forecasts by ${outcomeLabel}`, 'i'),
  });
}

describe('DashboardView', () => {
  beforeEach(() => {
    listPredictions.mockReset();
    listLeaderboard.mockReset();
    listTopics.mockReset();
    mockReplace.mockReset();
    mockSearchParams = new URLSearchParams();
    listLeaderboard.mockResolvedValue([leaderboardRow]);
    listTopics.mockResolvedValue([]);
  });

  test('given list error then retry succeeds, should show error then recover', async () => {
    let allowSuccess = false;
    listPredictions.mockImplementation(async () => {
      if (!allowSuccess) {
        throw new api.ApiError('offline', 503);
      }
      return [row(0)];
    });

    render(<DashboardView />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
    expect(screen.getByText('offline')).toBeInTheDocument();

    allowSuccess = true;
    fireEvent.click(screen.getByRole('button', { name: /retry/i }));

    await waitFor(() => {
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
    await waitFor(() => {
      const toDetail = screen.getAllByRole('link').filter(
        el => el.getAttribute('href') === '/predictions/id-0',
      );
      expect(toDetail.length).toBeGreaterThan(0);
    });
  });

  test('given full first page, load more should request next offset', async () => {
    const page1 = Array.from({ length: 50 }, (_, i) => row(i));
    listPredictions.mockImplementation(async (filters?: PredictionFilters) => {
      if ((filters?.offset ?? 0) === 0) return page1;
      return [row(99)];
    });

    render(<DashboardView />);

    await waitFor(() => {
      expect(screen.getAllByText('Prediction 0').length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getByRole('button', { name: /^load more$/i }));

    await waitFor(() => {
      const links = screen.getAllByRole('link', { name: /prediction 99/i });
      expect(links.length).toBeGreaterThan(0);
      expect(
        links.some(el => el.getAttribute('href') === '/predictions/id-99'),
      ).toBe(true);
    });

    expect(listPredictions).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 50, offset: 50 }),
      expect.any(AbortSignal),
    );
  });

  test('given loaded dashboard, should use distinct hero and list section titles', async () => {
    listPredictions.mockResolvedValue([row(0)]);

    render(<DashboardView />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { level: 2, name: 'Featured forecasts' }),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole('heading', { level: 2, name: 'Browse forecasts' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Popular forecasts' }),
    ).not.toBeInTheDocument();
  });

  test('given loaded dashboard, sort tabs should be hidden until toggled', async () => {
    listPredictions.mockResolvedValue([row(0)]);

    render(<DashboardView />);

    await waitFor(() => {
      expect(screen.getAllByText('Prediction 0').length).toBeGreaterThan(0);
    });

    expect(document.getElementById('prediction-sort-tabs')).toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: /^newest$/i })).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /show sort options/i }),
    ).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(screen.getByRole('button', { name: /show sort options/i }));

    expect(screen.getByRole('radio', { name: /^newest$/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /hide sort options/i }),
    ).toHaveAttribute('aria-expanded', 'true');
  });

  test('given non-default sort with collapsed panel, should show visible sorted label', async () => {
    listPredictions.mockResolvedValue([row(0)]);

    render(<DashboardView />);

    await waitFor(() => {
      expect(screen.getAllByText('Prediction 0').length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getByRole('button', { name: /show sort options/i }));
    fireEvent.click(
      screen.getByRole('radio', { name: /most accurate source/i }),
    );
    fireEvent.click(screen.getByRole('button', { name: /hide sort options/i }));

    expect(screen.getByText(/sorted:/i)).toHaveTextContent('Most accurate source');
    expect(screen.queryByRole('radio', { name: /most accurate source/i }))
      .not.toBeInTheDocument();
  });

  test('clicking an outcome filter on a browse card should filter by status', async () => {
    listPredictions.mockImplementation(async (filters?: PredictionFilters) => {
      if (filters?.status === 'incorrect') {
        return [{ ...row(0), outcome: 'incorrect', text: 'Wrong take' }];
      }
      return [
        { ...row(0), outcome: 'incorrect', text: 'Wrong take' },
        { ...row(1), outcome: 'correct', text: 'Right take' },
      ];
    });

    render(<DashboardView />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /browse forecasts/i }),
      ).toBeInTheDocument();
    });

    fireEvent.click(outcomeFilterInBrowseCard(/wrong take/i, 'incorrect'));

    await waitFor(() => {
      const browseSection = screen
        .getByRole('heading', { name: /browse forecasts/i })
        .closest('section')!;
      expect(within(browseSection).getByText('Showing:')).toBeInTheDocument();
      const status = within(browseSection).getByText('Showing:').closest('[role="status"]');
      expect(status).toHaveAttribute('aria-live', 'polite');
      expect(
        within(browseSection).getByRole('button', { name: /clear status filter/i }),
      ).toBeInTheDocument();
    });

    expect(listPredictions).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'incorrect', limit: 20, offset: 0 }),
      expect.any(AbortSignal),
    );
  });

  test('clicking active outcome filter again should clear status filter', async () => {
    listPredictions.mockImplementation(async (filters?: PredictionFilters) => {
      if (filters?.status === 'incorrect') {
        return [{ ...row(0), outcome: 'incorrect', text: 'Wrong take' }];
      }
      return [
        { ...row(0), outcome: 'incorrect', text: 'Wrong take' },
        { ...row(1), outcome: 'correct', text: 'Right take' },
      ];
    });

    render(<DashboardView />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /browse forecasts/i }),
      ).toBeInTheDocument();
    });

    fireEvent.click(outcomeFilterInBrowseCard(/wrong take/i, 'incorrect'));
    await waitFor(() => {
      const browseSection = screen
        .getByRole('heading', { name: /browse forecasts/i })
        .closest('section')!;
      expect(within(browseSection).getByText('Showing:')).toBeInTheDocument();
    });

    fireEvent.click(outcomeFilterInBrowseCard(/wrong take/i, 'incorrect'));

    await waitFor(() => {
      const browseSection = screen
        .getByRole('heading', { name: /browse forecasts/i })
        .closest('section')!;
      expect(within(browseSection).queryByText('Showing:')).not.toBeInTheDocument();
    });

    expect(listPredictions).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'all', limit: 50, offset: 0 }),
      expect.any(AbortSignal),
    );
  });

  test('changing topic tab while outcome filter is active should clear outcome filter', async () => {
    listPredictions.mockImplementation(async (filters?: PredictionFilters) => {
      if (filters?.status === 'incorrect') {
        return [{ ...row(0), outcome: 'incorrect', text: 'Wrong take' }];
      }
      if (filters?.topic === 'finance') {
        return [{ ...row(1), text: 'Finance only' }];
      }
      return [
        { ...row(0), outcome: 'incorrect', text: 'Wrong take' },
        { ...row(1), outcome: 'correct', text: 'Right take' },
      ];
    });

    const { rerender } = render(<DashboardView />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /browse forecasts/i }),
      ).toBeInTheDocument();
    });

    fireEvent.click(outcomeFilterInBrowseCard(/wrong take/i, 'incorrect'));

    await waitFor(() => {
      const browseSection = screen
        .getByRole('heading', { name: /browse forecasts/i })
        .closest('section')!;
      expect(within(browseSection).getByText('Showing:')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('radio', { name: /^finance$/i }));

    await waitFor(() => {
      const browseSection = screen
        .getByRole('heading', { name: /browse forecasts/i })
        .closest('section')!;
      expect(within(browseSection).queryByText('Showing:')).not.toBeInTheDocument();
    });

    expect(mockReplace).toHaveBeenCalledWith('/?topic=finance', { scroll: false });

    mockSearchParams = new URLSearchParams('topic=finance');
    rerender(<DashboardView />);

    await waitFor(() => {
      expect(listPredictions).toHaveBeenCalledWith(
        expect.objectContaining({ topic: 'finance', limit: 20, offset: 0 }),
        expect.any(AbortSignal),
      );
    });
  });

  test('given topic=finance in URL, should activate Finance tab and filter browse feed', async () => {
    mockSearchParams = new URLSearchParams('topic=finance');
    listPredictions.mockImplementation(async (filters?: PredictionFilters) => {
      if (filters?.topic === 'finance') {
        return [{ ...row(1), text: 'Finance only' }];
      }
      return [row(0)];
    });

    render(<DashboardView />);

    await waitFor(() => {
      expect(screen.getByRole('radio', { name: /^finance$/i })).toBeChecked();
    });

    expect(listPredictions).toHaveBeenCalledWith(
      expect.objectContaining({ topic: 'finance', limit: 20, offset: 0 }),
      expect.any(AbortSignal),
    );
  });

  test('given All topic tab selected, should remove topic from URL', async () => {
    mockSearchParams = new URLSearchParams('topic=finance');
    listPredictions.mockResolvedValue([row(0)]);

    render(<DashboardView />);

    await waitFor(() => {
      expect(screen.getByRole('radio', { name: /^finance$/i })).toBeChecked();
    });

    fireEvent.click(screen.getByRole('radio', { name: /^all$/i }));

    expect(mockReplace).toHaveBeenCalledWith('/', { scroll: false });
  });

  test('given curated topic slug in URL, should redirect to topic page', async () => {
    mockSearchParams = new URLSearchParams('topic=ai-regulation-2026');
    listPredictions.mockResolvedValue([row(0)]);

    render(<DashboardView />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        '/ai-regulation-2026',
        { scroll: false },
      );
    });

    expect(listPredictions).not.toHaveBeenCalled();
  });

  test('given unknown topic slug in URL, should strip topic from URL and show All tab', async () => {
    mockSearchParams = new URLSearchParams('topic=not-a-real-slug');
    listPredictions.mockResolvedValue([row(0)]);

    render(<DashboardView />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/', { scroll: false });
      expect(
        screen.getByRole('radio', { name: /^all$/i }),
      ).toBeChecked();
    });
  });

  test('given trending topics loaded, should still show browse topic tabs', async () => {
    listTopics.mockResolvedValue([
      {
        id: 'topic-ai-regulation-2026',
        slug: 'ai-regulation-2026',
        name: 'AI regulation 2026',
        kind: 'curated',
        parentTopicIds: ['topic-tech', 'topic-politics'],
        count: 3,
        recentCount: 2,
      },
    ]);
    listPredictions.mockResolvedValue([row(0)]);

    render(<DashboardView />);

    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: /ai regulation 2026/i }),
      ).toBeInTheDocument();
    });

    expect(screen.getByRole('radio', { name: /^all$/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /^finance$/i })).toBeInTheDocument();
  });

  test('trending topic link navigates to topic page', async () => {
    listTopics.mockResolvedValue([
      {
        id: 'topic-ai-regulation-2026',
        slug: 'ai-regulation-2026',
        name: 'AI regulation 2026',
        kind: 'curated',
        parentTopicIds: ['topic-tech', 'topic-politics'],
        count: 3,
        recentCount: 2,
      },
    ]);

    render(<DashboardView />);

    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: /ai regulation 2026/i }),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole('link', { name: /ai regulation 2026/i }),
    ).toHaveAttribute('href', '/ai-regulation-2026');
  });
});
