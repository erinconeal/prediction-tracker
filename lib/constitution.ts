import { readFile } from "node:fs/promises";
import path from "node:path";

const CONSTITUTION_FILENAME = "constitution.md";

export async function readConstitutionMarkdown(): Promise<string> {
  const fullPath = path.join(process.cwd(), CONSTITUTION_FILENAME);
  return readFile(fullPath, "utf8");
}

/**
 * Removes the first ATX H1 (`# Title`) so the page can own a single document `<h1>`.
 */
export function stripLeadingAtxHeading(markdown: string): string {
  const trimmed = markdown.trimStart();
  if (!trimmed.startsWith("# ")) {
    return markdown;
  }
  const firstNewline = trimmed.indexOf("\n");
  const rest =
    firstNewline === -1 ? "" : trimmed.slice(firstNewline + 1);
  return rest.replace(/^\n+/, "");
}

/** Plain text of the first ATX H1 line, if present (e.g. document title + version). */
export function readLeadingAtxHeadingText(markdown: string): string | null {
  const trimmed = markdown.trimStart();
  if (!trimmed.startsWith("# ")) {
    return null;
  }
  const firstNewline = trimmed.indexOf("\n");
  const line =
    firstNewline === -1
      ? trimmed.slice(2)
      : trimmed.slice(2, firstNewline);
  const title = line.trim();
  return title.length > 0 ? title : null;
}
