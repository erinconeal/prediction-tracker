export type MethodologyTocLevel = 2 | 3 | 4 | 5 | 6;

export type MethodologyTocEntry = {
  level: MethodologyTocLevel;
  text: string;
  id: string;
};

const ATX_HEADING_RE = /^(#{2,6})\s+(.+?)(?:\s+#+\s*)?$/;

/**
 * GitHub-style slug for URL fragments (stable for deep links to `/about#…`).
 */
export function slugifyMethodologyHeading(text: string): string {
  const base = text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base.length > 0 ? base : "section";
}

function uniqueSlug(base: string, used: Set<string>): string {
  let id = base;
  let n = 2;
  while (used.has(id)) {
    id = `${base}-${n}`;
    n += 1;
  }
  used.add(id);
  return id;
}

/**
 * Extract ATX headings (levels 2–6) from markdown for TOC and anchor ids.
 * Skips lines inside fenced code blocks (```).
 */
export function extractMethodologyToc(markdown: string): MethodologyTocEntry[] {
  const lines = markdown.split(/\r?\n/);
  let inFence = false;
  const entries: MethodologyTocEntry[] = [];
  const usedSlugs = new Set<string>();

  for (const line of lines) {
    const trimmedStart = line.trimStart();
    if (trimmedStart.startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const m = line.match(ATX_HEADING_RE);
    if (!m) continue;

    const hashes = m[1];
    const level = hashes.length as MethodologyTocLevel;
    if (level < 2 || level > 6) continue;

    let rawText = m[2].trim();
    rawText = rawText.replace(/\s+#+\s*$/, "").trim();
    if (!rawText) continue;

    const baseSlug = slugifyMethodologyHeading(rawText);
    const id = uniqueSlug(baseSlug, usedSlugs);
    entries.push({ level, text: rawText, id });
  }

  return entries;
}
