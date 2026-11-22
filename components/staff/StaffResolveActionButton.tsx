'use client';

import type { TerminalOutcome } from '@/types/prediction';

type StaffResolveActionButtonProps = {
  children: string;
  disabled?: boolean;
  outcome: TerminalOutcome;
  onClick: () => void;
};

const actionLayout
  = 'inline-flex min-h-11 items-center rounded-lg px-3 text-base font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50';

const actionColor: Record<TerminalOutcome, string> = {
  correct: 'bg-primary text-primary-foreground hover:bg-primary-hover',
  incorrect: 'bg-error text-error-foreground hover:opacity-90',
  invalid: 'bg-error text-error-foreground hover:opacity-90',
  unresolved: 'border border-info/40 bg-info/15 text-info hover:bg-info/25',
};

export function StaffResolveActionButton({
  children,
  disabled = false,
  outcome,
  onClick,
}: StaffResolveActionButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      aria-disabled={disabled}
      className={`${actionLayout} ${actionColor[outcome]}`}
      onClick={onClick}
    >
      {disabled ? 'Submitting...' : children}
    </button>
  );
}
