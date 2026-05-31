/** Compact display for counts (e.g. 4300 → 4.3k, 4_300_000 → 4.3m). */
export function formatCompactCount(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return m >= 10
      ? `${Math.round(m)}m`
      : `${trimTrailingZero(m.toFixed(1))}m`;
  }
  if (n >= 1000) {
    return `${trimTrailingZero((n / 1000).toFixed(1))}k`;
  }
  return String(n);
}

function trimTrailingZero(value: string): string {
  return value.replace(/\.0$/, '');
}
