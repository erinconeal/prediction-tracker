import type { Outcome } from "@/types/prediction";

const styles: Record<Outcome, string> = {
  pending:
    "bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200",
  correct:
    "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-200",
  incorrect: "bg-red-100 text-red-900 dark:bg-red-950/80 dark:text-red-200",
  unresolved:
    "bg-slate-100 text-slate-900 dark:bg-slate-800/90 dark:text-slate-200",
  invalid:
    "bg-zinc-100 text-zinc-700 dark:bg-zinc-800/90 dark:text-zinc-300",
};

const labels: Record<Outcome, string> = {
  pending: "Pending",
  correct: "Correct",
  incorrect: "Incorrect",
  unresolved: "Unresolved",
  invalid: "Invalid",
};

type OutcomeBadgeProps = {
  outcome: Outcome;
  className?: string;
};

export function OutcomeBadge({ outcome, className = "" }: OutcomeBadgeProps) {
  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[outcome]} ${className}`.trim()}
    >
      {labels[outcome]}
    </span>
  );
}
