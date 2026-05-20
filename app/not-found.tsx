import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg rounded-xl border border-border bg-surface-elevated px-6 py-10 text-center shadow-sm">
      <p className="text-sm font-medium text-muted">404</p>
      <h1 className="mt-2 text-xl font-semibold text-foreground">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-muted">
        This path does not exist or is not available.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        Back to home
      </Link>
    </div>
  );
}
