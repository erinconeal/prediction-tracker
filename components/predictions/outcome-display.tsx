import type { Outcome } from '@/types/prediction';
import {
  Check,
  CircleQuestionMark,
  CircleX,
  Clock,
  X,
  type LucideIcon,
} from 'lucide-react';

export const outcomeStyles: Record<Outcome, string> = {
  pending:
    'border border-warning/40 bg-warning/15 text-foreground',
  correct: 'bg-success/15 text-success',
  incorrect: 'bg-error/15 text-error',
  unresolved: 'bg-info/15 text-info',
  invalid:
    'border border-border bg-surface text-muted ring-1 ring-border/80',
};

/** Interactive browse filter chips only (hover/active); static badges use `outcomeStyles`. */
export const outcomeFilterButtonStyles: Record<Outcome, string> = {
  pending:
    'border border-warning/40 bg-warning/15 text-foreground hover:bg-warning/25 active:bg-warning/30',
  correct:
    'bg-success/15 text-success hover:bg-success/25 active:bg-success/30',
  incorrect:
    'bg-error/15 text-error hover:bg-error/25 active:bg-error/30',
  unresolved:
    'bg-info/15 text-info hover:bg-info/25 active:bg-info/30',
  invalid:
    'border border-border bg-surface text-muted ring-1 ring-border/80 hover:bg-surface-elevated active:bg-border/40',
};

export const outcomeLabels: Record<Outcome, string> = {
  pending: 'Pending',
  correct: 'Correct',
  incorrect: 'Incorrect',
  unresolved: 'Unresolved',
  invalid: 'Invalid',
};

/** Circular outcome icon backgrounds for compact list rows (e.g. recent resolutions). */
export const outcomeIconCircleStyles: Record<Outcome, string> = {
  pending: 'bg-warning/15 text-foreground',
  correct: 'bg-success/15 text-success',
  incorrect: 'bg-error/15 text-error',
  unresolved: 'bg-info/15 text-info',
  invalid: 'bg-surface text-muted ring-1 ring-border/80',
};

/** Outcome label accent colors paired with `outcomeLabels`. */
export const outcomeAccentTextStyles: Record<Outcome, string> = {
  pending: 'text-foreground',
  correct: 'text-success',
  incorrect: 'text-error',
  unresolved: 'text-info',
  invalid: 'text-muted',
};

const OUTCOME_GLYPHS: Record<Outcome, LucideIcon> = {
  pending: Clock,
  correct: Check,
  incorrect: X,
  unresolved: CircleQuestionMark,
  invalid: CircleX,
};

const GLYPH_CLASS = 'size-3 shrink-0 stroke-current';

export function OutcomeGlyph({ outcome }: { outcome: Outcome }) {
  const Icon = OUTCOME_GLYPHS[outcome];
  return <Icon className={GLYPH_CLASS} aria-hidden strokeWidth={1.75} />;
}
