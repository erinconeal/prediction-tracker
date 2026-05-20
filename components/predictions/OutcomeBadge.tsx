import type { Outcome } from '@/types/prediction';
import {
  OutcomeGlyph,
  outcomeLabels,
  outcomeStyles,
} from './outcome-display';

type OutcomeBadgeProps = {
  outcome: Outcome;
  className?: string;
};

export function OutcomeBadge({ outcome, className = '' }: OutcomeBadgeProps) {
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${outcomeStyles[outcome]} ${className}`.trim()}
    >
      <OutcomeGlyph outcome={outcome} />
      {outcomeLabels[outcome]}
    </span>
  );
}
