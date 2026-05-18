"use client";

import { memo } from "react";
import type { Outcome } from "@/types/prediction";
import {
  OutcomeGlyph,
  outcomeLabels,
  outcomeStyles,
} from "./outcome-display";

type OutcomeFilterButtonProps = {
  outcome: Outcome;
  pressed?: boolean;
  onFilter: (outcome: Outcome) => void;
  className?: string;
};

export const OutcomeFilterButton = memo(function OutcomeFilterButton({
  outcome,
  pressed = false,
  onFilter,
  className = "",
}: OutcomeFilterButtonProps) {
  const label = outcomeLabels[outcome];

  return (
    <button
      type="button"
      className={`inline-flex min-h-7 shrink-0 items-center justify-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background ${outcomeStyles[outcome]} ${pressed ? "ring-2 ring-interactive ring-offset-2 ring-offset-background" : ""} ${className}`.trim()}
      aria-label={`Filter browse forecasts by ${label}`}
      aria-pressed={pressed}
      onClick={() => onFilter(outcome)}
    >
      <OutcomeGlyph outcome={outcome} />
      {label}
    </button>
  );
});
