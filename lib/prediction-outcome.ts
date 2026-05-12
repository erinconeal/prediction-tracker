import type { Outcome } from "@/types/prediction";

/** Pre-resolution row — no terminal outcome yet (constitution capture / open window). */
export function isPendingOutcome(outcome: Outcome): boolean {
  return outcome === "pending";
}

/** Terminal lifecycle outcome (Correct / Incorrect / Unresolved / Invalid in constitution §6.3). */
export function isTerminalOutcome(outcome: Outcome): boolean {
  return outcome !== "pending";
}

/** Included in accuracy denominator: Correct + Incorrect only (constitution §7.2). */
export function isScoredOutcome(outcome: Outcome): boolean {
  return outcome === "correct" || outcome === "incorrect";
}
