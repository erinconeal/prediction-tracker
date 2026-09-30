import { describe, expect, test } from 'vitest';
import {
  isScoredOutcome,
  isStillOpenOutcome,
  isTerminalOutcome,
  judgePredictionOutcome,
} from './prediction-outcome';
import { isTerminalOutcomeValue } from '@/types/prediction';

describe('isTerminalOutcome', () => {
  test('given still_open, should return false', () => {
    expect(isTerminalOutcome('still_open')).toBe(false);
  });

  test('given terminal outcomes, should return true', () => {
    expect(isTerminalOutcome('correct')).toBe(true);
    expect(isTerminalOutcome('incorrect')).toBe(true);
    expect(isTerminalOutcome('unresolved')).toBe(true);
    expect(isTerminalOutcome('invalid')).toBe(true);
  });
});

describe('isTerminalOutcomeValue', () => {
  test('given still_open, should return false', () => {
    expect(isTerminalOutcomeValue('still_open')).toBe(false);
  });

  test('given terminal outcome strings, should return true', () => {
    expect(isTerminalOutcomeValue('correct')).toBe(true);
    expect(isTerminalOutcomeValue('incorrect')).toBe(true);
  });

  test('given non-string or unknown values, should return false', () => {
    expect(isTerminalOutcomeValue(null)).toBe(false);
    expect(isTerminalOutcomeValue('pending')).toBe(false);
  });
});

describe('isStillOpenOutcome', () => {
  test('given still_open only, should return true', () => {
    expect(isStillOpenOutcome('still_open')).toBe(true);
    expect(isStillOpenOutcome('correct')).toBe(false);
  });
});

describe('isScoredOutcome', () => {
  test('given correct or incorrect only, should return true', () => {
    expect(isScoredOutcome('correct')).toBe(true);
    expect(isScoredOutcome('incorrect')).toBe(true);
    expect(isScoredOutcome('unresolved')).toBe(false);
  });
});

describe('judgePredictionOutcome', () => {
  const deadline = '2026-12-31T00:00:00.000Z';
  const duringDeadlineDay = new Date('2026-12-31T23:00:00.000Z');
  const afterDeadlineDay = new Date('2027-01-01T00:00:00.000Z');
  const resolutionUrl = 'https://example.com/result';

  test('given a deadline day that has not ended, should return deadline_not_passed even with a URL', () => {
    expect(judgePredictionOutcome({
      currentOutcome: 'still_open',
      requestedOutcome: 'correct',
      targetDate: deadline,
      resolutionUrl,
      now: duringDeadlineDay,
    }).reason).toBe('deadline_not_passed');
  });

  test('given the next UTC midnight and an https URL, should allow correct', () => {
    expect(judgePredictionOutcome({
      currentOutcome: 'still_open',
      requestedOutcome: 'correct',
      targetDate: deadline,
      resolutionUrl,
      now: afterDeadlineDay,
    }).reason).toBe('allowed');
  });

  test('given correct after the deadline day with no URL, should require a resolution URL', () => {
    expect(judgePredictionOutcome({
      currentOutcome: 'still_open',
      requestedOutcome: 'correct',
      targetDate: deadline,
      resolutionUrl: null,
      now: afterDeadlineDay,
    }).reason).toBe('resolution_url_required');
  });

  test('given incorrect after the deadline day with no URL, should require a resolution URL', () => {
    expect(judgePredictionOutcome({
      currentOutcome: 'still_open',
      requestedOutcome: 'incorrect',
      targetDate: deadline,
      resolutionUrl: null,
      now: afterDeadlineDay,
    }).reason).toBe('resolution_url_required');
  });

  test('given correct after the deadline day with a javascript URL, should require a resolution URL', () => {
    expect(judgePredictionOutcome({
      currentOutcome: 'still_open',
      requestedOutcome: 'correct',
      targetDate: deadline,
      resolutionUrl: 'javascript:alert(1)',
      now: afterDeadlineDay,
    }).reason).toBe('resolution_url_required');
  });

  test('given correct after the deadline day with an http URL, should allow it', () => {
    expect(judgePredictionOutcome({
      currentOutcome: 'still_open',
      requestedOutcome: 'correct',
      targetDate: deadline,
      resolutionUrl: 'http://example.com/result',
      now: afterDeadlineDay,
    }).reason).toBe('allowed');
  });

  test('given unresolved after the deadline day, should allow it without a URL', () => {
    expect(judgePredictionOutcome({
      currentOutcome: 'still_open',
      requestedOutcome: 'unresolved',
      targetDate: deadline,
      resolutionUrl: null,
      now: afterDeadlineDay,
    }).reason).toBe('allowed');
  });

  test('given no deadline, should allow invalid', () => {
    expect(judgePredictionOutcome({
      currentOutcome: 'still_open',
      requestedOutcome: 'invalid',
      targetDate: null,
      resolutionUrl: null,
      now: duringDeadlineDay,
    }).reason).toBe('allowed');
  });

  test('given no deadline, should reject correct', () => {
    expect(judgePredictionOutcome({
      currentOutcome: 'still_open',
      requestedOutcome: 'correct',
      targetDate: null,
      resolutionUrl,
      now: duringDeadlineDay,
    }).reason).toBe('missing_deadline');
  });

  test('given a blank deadline, should return missing_deadline', () => {
    expect(judgePredictionOutcome({
      currentOutcome: 'still_open',
      requestedOutcome: 'correct',
      targetDate: '   ',
      resolutionUrl,
      now: duringDeadlineDay,
    }).reason).toBe('missing_deadline');
  });

  test('given a deadline that is not a date, should return missing_deadline', () => {
    expect(judgePredictionOutcome({
      currentOutcome: 'still_open',
      requestedOutcome: 'correct',
      targetDate: 'soon',
      resolutionUrl,
      now: duringDeadlineDay,
    }).reason).toBe('missing_deadline');
  });

  test('given still_open to invalid before the deadline day ends, should allow it', () => {
    expect(judgePredictionOutcome({
      currentOutcome: 'still_open',
      requestedOutcome: 'invalid',
      targetDate: deadline,
      resolutionUrl: null,
      now: duringDeadlineDay,
    }).reason).toBe('allowed');
  });

  test('given correct to incorrect, should return already_terminal', () => {
    expect(judgePredictionOutcome({
      currentOutcome: 'correct',
      requestedOutcome: 'incorrect',
      targetDate: deadline,
      resolutionUrl,
      now: afterDeadlineDay,
    }).reason).toBe('already_terminal');
  });

  test('given correct to invalid, should allow it without a resolution URL', () => {
    expect(judgePredictionOutcome({
      currentOutcome: 'correct',
      requestedOutcome: 'invalid',
      targetDate: deadline,
      resolutionUrl: null,
      now: afterDeadlineDay,
    }).reason).toBe('allowed');
  });

  test('given the same terminal outcome, should return same_outcome', () => {
    expect(judgePredictionOutcome({
      currentOutcome: 'correct',
      requestedOutcome: 'correct',
      targetDate: deadline,
      resolutionUrl: null,
      now: afterDeadlineDay,
    }).reason).toBe('same_outcome');
  });
});
