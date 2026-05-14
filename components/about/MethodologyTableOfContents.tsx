import Link from "next/link";
import type { MethodologyTocEntry } from "@/lib/methodology-toc";

type MethodologyTableOfContentsProps = {
  entries: readonly MethodologyTocEntry[];
};

const linkClassName =
  "block rounded-md py-2 text-muted transition-colors hover:bg-surface hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function MethodologyTableOfContents({
  entries,
}: MethodologyTableOfContentsProps) {
  if (entries.length === 0) return null;

  return (
    <nav
      aria-labelledby="methodology-toc-heading"
      className="rounded-xl border border-border bg-surface-elevated p-4 shadow-sm xl:sticky xl:top-24 xl:max-h-[calc(100vh-8rem)] xl:overflow-y-auto"
    >
      <h2
        id="methodology-toc-heading"
        className="text-xs font-semibold uppercase tracking-wide text-muted"
      >
        On this page
      </h2>
      <ol className="mt-3 list-none space-y-0.5 p-0 text-sm">
        {entries.map((entry) => (
          <li
            key={entry.id}
            className={
              entry.level === 3
                ? "ps-3"
                : entry.level >= 4
                  ? "ps-6"
                  : undefined
            }
          >
            <Link href={`/about#${entry.id}`} className={linkClassName}>
              {entry.text}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}
