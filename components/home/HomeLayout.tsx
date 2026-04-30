import type { ReactNode } from "react";

type HomeLayoutProps = {
  /**
   * Optional hero (e.g. featured carousel). On large screens, `aside` is placed
   * beside this row so both columns share the same height (`items-stretch`).
   */
  hero?: ReactNode;
  /** Primary content below the hero row (or full width when no `aside`). */
  main: ReactNode;
  /** Right rail on large screens (e.g. leaderboard). */
  aside?: ReactNode;
};

/**
 * Two-column shell for a topic-driven home: optional hero + aside row, then main feed.
 */
export function HomeLayout({ hero, main, aside }: HomeLayoutProps) {
  if (aside === undefined || aside === null) {
    return (
      <div className="w-full space-y-10">
        {hero !== undefined && hero !== null ? (
          <div className="min-w-0">{hero}</div>
        ) : null}
        <div className="min-w-0">{main}</div>
      </div>
    );
  }

  if (hero !== undefined && hero !== null) {
    return (
      <div className="space-y-10">
        <div className="grid w-full gap-8 lg:grid-cols-[1fr_min(320px,32%)] lg:items-stretch">
          <div className="min-w-0">{hero}</div>
          <aside className="flex min-h-0 min-w-0 flex-col lg:sticky lg:top-24">
            <div className="flex min-h-0 flex-1 flex-col">{aside}</div>
          </aside>
        </div>
        <div className="min-w-0">{main}</div>
      </div>
    );
  }

  return (
    <div className="grid w-full gap-8 lg:grid-cols-[1fr_min(320px,32%)] lg:items-start">
      <div className="min-w-0">{main}</div>
      <aside className="min-w-0 lg:sticky lg:top-24">{aside}</aside>
    </div>
  );
}
