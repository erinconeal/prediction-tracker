import { ApiError, listLeaderboard } from '@/services/api';
import type { LeaderboardPage } from '@/lib/leaderboard';
import { isAbortError } from '@/utils/is-abort-error';

export type FetchLeaderboardPageOptions = {
  limit: number;
  offset: number;
  signal?: AbortSignal;
};

export type LeaderboardFetchOutcome
  = | { ok: true; page: LeaderboardPage }
    | { ok: false; aborted: true }
    | { ok: false; aborted: false; error: string };

export function getLeaderboardFetchErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : 'Something went wrong';
}

export async function fetchLeaderboardPage(
  options: FetchLeaderboardPageOptions,
): Promise<LeaderboardPage> {
  return listLeaderboard(options);
}

export async function loadLeaderboardPageWithOutcome(
  options: FetchLeaderboardPageOptions,
): Promise<LeaderboardFetchOutcome> {
  try {
    const page = await fetchLeaderboardPage(options);
    return { ok: true, page };
  }
  catch (error: unknown) {
    if (isAbortError(error)) return { ok: false, aborted: true };
    return { ok: false, aborted: false, error: getLeaderboardFetchErrorMessage(error) };
  }
}
