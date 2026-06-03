import { describe, expect, test } from 'vitest';
import {
  isScoredOutcome,
  isStillOpenOutcome,
  isTerminalOutcome,
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
