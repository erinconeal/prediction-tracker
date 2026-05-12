import Link from "next/link";
import type { MethodologyTocEntry } from "@/lib/methodology-toc";

type MethodologyTableOfContentsProps = {
  entries: readonly MethodologyTocEntry[];
};

const linkClassName =
  "block rounded-md py-2 text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-zinc-300 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-50 dark:focus-visible:ring-zinc-500 dark:focus-visible:ring-offset-zinc-950";

export function MethodologyTableOfContents({
  entries,
}: MethodologyTableOfContentsProps) {
  if (entries.length === 0) return null;

  return (
    <nav
      aria-labelledby="methodology-toc-heading"
      className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/50 xl:sticky xl:top-24 xl:max-h-[calc(100vh-8rem)] xl:overflow-y-auto"
    >
      <h2
        id="methodology-toc-heading"
        className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
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
