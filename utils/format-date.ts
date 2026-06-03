export function formatIsoDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** e.g. "Dec 2026" for charts and cards when a day-level date is not needed. */
export function formatMonthYear(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, {
    month: 'short',
    year: 'numeric',
  });
}

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Relative finish time for sidebar copy (e.g. "2h ago", "Yesterday"). */
export function formatFinishedRelativeTime(
  iso: string,
  now: Date = new Date(),
): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return iso;

  const diffMs = now.getTime() - then.getTime();
  if (diffMs < 0) return formatIsoDate(iso);

  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const dayDiff = Math.round(
    (startOfLocalDay(now).getTime() - startOfLocalDay(then).getTime())
    / 86_400_000,
  );

  if (dayDiff === 0) {
    const diffHours = Math.floor(diffMs / 3_600_000);
    return `${diffHours}h ago`;
  }
  if (dayDiff === 1) return 'Yesterday';
  return formatIsoDate(iso);
}
