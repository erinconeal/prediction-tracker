import Link from "next/link";

const emphasisLinkClassName =
  "inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md px-3 text-sm font-semibold text-ink underline-offset-4 transition-colors hover:text-interactive hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-surface-elevated/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link
          href="/"
          className="font-serif text-xl font-normal tracking-tight text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          Prediction Tracker
        </Link>
        <nav aria-label="Main">
          <ul className="flex flex-wrap items-center gap-1">
            <li>
              <Link
                href="/about"
                className={emphasisLinkClassName}
                title="Scoring constitution and methodology"
              >
                Methodology
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
