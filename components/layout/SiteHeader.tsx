import Link from "next/link";

const navLinkClassName =
  "inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md px-3 text-sm font-medium text-zinc-700 transition-colors hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-zinc-300 dark:hover:text-zinc-50 dark:focus-visible:ring-zinc-500 dark:focus-visible:ring-offset-zinc-950";

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link
          href="/"
          className="rounded-md text-lg font-semibold tracking-tight text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-zinc-50 dark:focus-visible:ring-zinc-500 dark:focus-visible:ring-offset-zinc-950"
        >
          Prediction Tracker
        </Link>
        <nav aria-label="Main">
          <ul className="flex items-center gap-1">
            <li>
              <Link href="/about" className={navLinkClassName}>
                About
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
