import type { Outcome } from "@/types/prediction";

export const outcomeStyles: Record<Outcome, string> = {
  pending:
    "border border-warning/40 bg-warning/15 text-foreground",
  correct: "bg-success/15 text-success",
  incorrect: "bg-error/15 text-error",
  unresolved: "bg-info/15 text-info",
  invalid:
    "border border-border bg-surface text-muted ring-1 ring-border/80",
};

export const outcomeLabels: Record<Outcome, string> = {
  pending: "Pending",
  correct: "Correct",
  incorrect: "Incorrect",
  unresolved: "Unresolved",
  invalid: "Invalid",
};

export function OutcomeGlyph({ outcome }: { outcome: Outcome }) {
  const cls = "size-3 shrink-0 stroke-current";
  switch (outcome) {
    case "pending":
      return (
        <svg className={cls} viewBox="0 0 12 12" fill="none" aria-hidden>
          <circle cx="6" cy="6" r="4.25" strokeWidth="1.25" />
          <path
            d="M6 3.25V6l2 1"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.25"
          />
        </svg>
      );
    case "correct":
      return (
        <svg className={cls} viewBox="0 0 12 12" fill="none" aria-hidden>
          <path
            d="M2.5 6l2.5 2.5L9.5 3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.35"
          />
        </svg>
      );
    case "incorrect":
      return (
        <svg className={cls} viewBox="0 0 12 12" fill="none" aria-hidden>
          <path
            d="M3 3l6 6M9 3L3 9"
            strokeLinecap="round"
            strokeWidth="1.35"
          />
        </svg>
      );
    case "unresolved":
      return (
        <svg className={cls} viewBox="0 0 12 12" fill="none" aria-hidden>
          <circle cx="6" cy="6" r="4.25" strokeWidth="1.25" />
          <path
            d="M4.5 5.25h.01M7.5 5.25h.01M4.25 8.25c.5.75 1.25 1.25 2.25 1.25s1.75-.5 2.25-1.25"
            strokeLinecap="round"
            strokeWidth="1.25"
          />
        </svg>
      );
    case "invalid":
      return (
        <svg className={cls} viewBox="0 0 12 12" fill="none" aria-hidden>
          <circle cx="6" cy="6" r="4.25" strokeWidth="1.25" />
          <path
            d="M3.5 3.5l5 5M8.5 3.5l-5 5"
            strokeLinecap="round"
            strokeWidth="1.15"
          />
        </svg>
      );
  }
}
