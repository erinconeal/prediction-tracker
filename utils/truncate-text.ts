/** Trim and shorten with an ellipsis when longer than `max` grapheme-safe-ish (length by JS string length). */
export function truncateWithEllipsis(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max)}…`;
}
