'use client';

import { memo } from 'react';
import type { Outcome } from '@/types/prediction';
import {
  OutcomeGlyph,
  outcomeFilterButtonStyles,
  outcomeLabels,
} from './outcome-display';

type OutcomeFilterButtonProps = {
  outcome: Outcome;
  onFilter: (outcome: Outcome) => void;
  className?: string;
};

export const OutcomeFilterButton = memo(function OutcomeFilterButton({
  outcome,
  onFilter,
  className = '',
}: OutcomeFilterButtonProps) {
  const label = outcomeLabels[outcome];

  return (
    <button
      type="button"
      className="cursor-pointer inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={`Filter browse forecasts by ${label}`}
      onClick={() => onFilter(outcome)}
    >
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${outcomeFilterButtonStyles[outcome]}`}
      >
        <OutcomeGlyph outcome={outcome} />
        {label}
      </span>
    </button>
  );
});
