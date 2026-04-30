import type { Outcome } from "@/types/prediction";

const styles: Record<Outcome, string> = {
  pending:
    "bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-200",
  correct:
    "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-200",
  incorrect: "bg-red-100 text-red-900 dark:bg-red-950/80 dark:text-red-200",
};

type OutcomeBadgeProps = {
  outcome: Outcome;
  className?: string;
};

export function OutcomeBadge({ outcome, className = "" }: OutcomeBadgeProps) {
  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[outcome]} ${className}`.trim()}
    >
      {outcome}
    </span>
  );
}
