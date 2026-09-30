import type { Outcome, TerminalOutcome } from '@/types/prediction';
import { isHttpOrHttpsUrl } from '@/utils/form-helpers';

export type JudgePredictionInput = {
  currentOutcome: Outcome;
  requestedOutcome: TerminalOutcome;
  targetDate: string | null;
  resolutionUrl: string | null;
  now: Date;
};

export type JudgeReason
  = | 'allowed'
    | 'same_outcome'
    | 'already_terminal'
    | 'missing_deadline'
    | 'deadline_not_passed'
    | 'resolution_url_required';

/** Pre-resolution row — no terminal outcome yet (constitution capture / open window). */
export function isStillOpenOutcome(outcome: Outcome): boolean {
  return outcome === 'still_open';
}

/** Terminal lifecycle outcome (Correct / Incorrect / Unresolved / Invalid in constitution §6.3). */
export function isTerminalOutcome(outcome: Outcome): boolean {
  return outcome !== 'still_open';
}

/** Included in accuracy denominator: Correct + Incorrect only (constitution §7.2). */
export function isScoredOutcome(outcome: Outcome): boolean {
  return outcome === 'correct' || outcome === 'incorrect';
}

/**
 * Whether a requested outcome is allowed for this row at `now`.
 * A date-only deadline is a UTC calendar day and stays open through that day.
 * Scoring opens at the next UTC midnight.
 * A blank or unparseable deadline is `missing_deadline`, not an open window.
 *
 * still_open
 *   deadline UTC day ended + http(s) URL -> correct | incorrect
 *   deadline UTC day ended               -> unresolved
 *   any time, no URL required            -> invalid
 * correct | incorrect | unresolved
 *   requested invalid                    -> allowed
 *   any other request                    -> already_terminal
 * same requested outcome                 -> same_outcome (no write)
 */
export function judgePredictionOutcome(input: JudgePredictionInput): { reason: JudgeReason } {
  const { currentOutcome, requestedOutcome, targetDate, resolutionUrl, now } = input;

  if (currentOutcome === requestedOutcome) {
    return { reason: 'same_outcome' };
  }

  if (isTerminalOutcome(currentOutcome) && requestedOutcome !== 'invalid') {
    return { reason: 'already_terminal' };
  }

  if (requestedOutcome === 'invalid') {
    return { reason: 'allowed' };
  }

  const deadline = parseDeadlineInstant(targetDate);
  if (!deadline) {
    return { reason: 'missing_deadline' };
  }

  if (!deadlineUtcDayHasEnded(deadline, now)) {
    return { reason: 'deadline_not_passed' };
  }

  if (isScoredOutcome(requestedOutcome) && !isHttpOrHttpsUrl(resolutionUrl ?? '')) {
    return { reason: 'resolution_url_required' };
  }

  return { reason: 'allowed' };
}

/** A trimmed instant, or null when the deadline is blank or not a date. */
function parseDeadlineInstant(targetDate: string | null): Date | null {
  const trimmed = targetDate?.trim() ?? '';
  if (!trimmed) return null;

  const target = new Date(trimmed);
  if (Number.isNaN(target.getTime())) return null;
  return target;
}

/** True once `now` is at or after the UTC midnight that follows the deadline's UTC day. */
function deadlineUtcDayHasEnded(target: Date, now: Date): boolean {
  const opensAt = Date.UTC(
    target.getUTCFullYear(),
    target.getUTCMonth(),
    target.getUTCDate() + 1,
  );
  return now.getTime() >= opensAt;
}
