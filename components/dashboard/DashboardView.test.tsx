import type { ReactNode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { Prediction } from '@/types/prediction';
import * as api from '@/services/api';
import type { PredictionFilters } from '@/types/prediction';
import { DashboardView } from './DashboardView';

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
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
    category: null,
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

describe('DashboardView', () => {
  beforeEach(() => {
    listPredictions.mockReset();
    listLeaderboard.mockReset();
    listTopics.mockReset();
    mockPush.mockReset();
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
      expect(screen.getAllByRole('link', { name: /wrong take/i }).length)
        .toBeGreaterThan(0);
    });

    fireEvent.click(
      screen.getAllByRole('button', {
        name: /filter browse forecasts by incorrect/i,
      })[0]!,
    );

    await waitFor(() => {
      expect(screen.getByText('Showing:')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /clear status filter/i }),
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
        screen.getAllByRole('button', {
          name: /filter browse forecasts by incorrect/i,
        }).length,
      ).toBeGreaterThan(0);
    });

    fireEvent.click(
      screen.getAllByRole('button', {
        name: /filter browse forecasts by incorrect/i,
      })[0]!,
    );
    await waitFor(() => {
      expect(screen.getByText('Showing:')).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole('button', {
        name: /filter browse forecasts by incorrect/i,
        pressed: true,
      }),
    );

    await waitFor(() => {
      expect(screen.queryByText('Showing:')).not.toBeInTheDocument();
    });

    expect(listPredictions).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'all', limit: 50, offset: 0 }),
      expect.any(AbortSignal),
    );
  });

  test('changing category while outcome filter is active should clear outcome filter', async () => {
    listPredictions.mockImplementation(async (filters?: PredictionFilters) => {
      if (filters?.status === 'incorrect') {
        return [{ ...row(0), outcome: 'incorrect', text: 'Wrong take' }];
      }
      if (filters?.category === 'Finance') {
        return [{ ...row(1), category: 'Finance', text: 'Finance only' }];
      }
      return [
        { ...row(0), outcome: 'incorrect', text: 'Wrong take' },
        { ...row(1), outcome: 'correct', text: 'Right take' },
      ];
    });

    render(<DashboardView />);

    await waitFor(() => {
      expect(
        screen.getAllByRole('button', {
          name: /filter browse forecasts by incorrect/i,
        }).length,
      ).toBeGreaterThan(0);
    });

    fireEvent.click(
      screen.getAllByRole('button', {
        name: /filter browse forecasts by incorrect/i,
      })[0]!,
    );

    await waitFor(() => {
      expect(screen.getByText('Showing:')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('radio', { name: /^finance$/i }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/category/finance');
    });
  });

  test('given trending topics loaded, should still show browse category tabs', async () => {
    listTopics.mockResolvedValue([
      {
        id: 'topic-ai',
        slug: 'ai-regulation-2026',
        name: 'AI regulation 2026',
        categories: ['Tech', 'Politics'],
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
        id: 'topic-ai',
        slug: 'ai-regulation-2026',
        name: 'AI regulation 2026',
        categories: ['Tech', 'Politics'],
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
    ).toHaveAttribute('href', '/topics/ai-regulation-2026');
  });
});
