import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ApiError } from '@/services/api';
import { buildLeaderboardPage } from '@/test/factories/leaderboard-page';
import {
  getLeaderboardFetchErrorMessage,
  loadLeaderboardPageWithOutcome,
} from './leaderboard-fetch';

const apiMocks = vi.hoisted(() => ({
  listLeaderboard: vi.fn(),
}));

vi.mock('@/services/api', async (importOriginal) => {
  const mod = await importOriginal<typeof import('@/services/api')>();
  return {
    ...mod,
    listLeaderboard: apiMocks.listLeaderboard,
  };
});

const listLeaderboard = apiMocks.listLeaderboard;

describe('getLeaderboardFetchErrorMessage', () => {
  test('given ApiError, should return its message', () => {
    expect(
      getLeaderboardFetchErrorMessage(new ApiError('Leaderboard unavailable', 503)),
    ).toBe('Leaderboard unavailable');
  });

  test('given unknown error, should return generic message', () => {
    expect(getLeaderboardFetchErrorMessage(new Error('boom'))).toBe(
      'Something went wrong',
    );
  });
});

describe('loadLeaderboardPageWithOutcome', () => {
  beforeEach(() => {
    listLeaderboard.mockReset();
  });

  test('given listLeaderboard resolves, should return ok page outcome', async () => {
    const page = buildLeaderboardPage({ total: 3 });
    listLeaderboard.mockResolvedValue(page);

    const outcome = await loadLeaderboardPageWithOutcome({
      limit: 50,
      offset: 0,
    });

    expect(outcome).toEqual({ ok: true, page });
    expect(listLeaderboard).toHaveBeenCalledWith({
      limit: 50,
      offset: 0,
      signal: undefined,
    });
  });

  test('given abort error, should return aborted outcome', async () => {
    const abort = new DOMException('Aborted', 'AbortError');
    listLeaderboard.mockRejectedValue(abort);

    const outcome = await loadLeaderboardPageWithOutcome({
      limit: 10,
      offset: 0,
      signal: new AbortController().signal,
    });

    expect(outcome).toEqual({ ok: false, aborted: true });
  });

  test('given ApiError, should return error outcome with message', async () => {
    listLeaderboard.mockRejectedValue(new ApiError('Server error', 500));

    const outcome = await loadLeaderboardPageWithOutcome({
      limit: 10,
      offset: 0,
    });

    expect(outcome).toEqual({
      ok: false,
      aborted: false,
      error: 'Server error',
    });
  });
});
