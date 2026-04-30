"use client";

import Link from "next/link";
import { memo, type ReactNode } from "react";
import { formatIsoDate, formatMonthYear } from "@/utils/format-date";
import type { Prediction } from "@/types/prediction";
import { OutcomeBadge } from "./OutcomeBadge";

export type PredictionCardSize = "compact" | "default" | "featured";

export type PredictionCardProps = {
  prediction: Prediction;
  /** compact = list density; default = grid; featured = hero cards */
  size?: PredictionCardSize;
  /** Link source name to `/source/[slug]` */
  linkSource?: boolean;
  /** Optional confidence / score line under metadata */
  scoreSlot?: ReactNode;
  /** Actions row (e.g. mark correct / incorrect) */
  footerSlot?: ReactNode;
  /** When set, shows created timestamp in the metadata block (list / admin views). */
  showCreatedAt?: boolean;
  className?: string;
};

const sizeClass: Record<PredictionCardSize, string> = {
  compact: "p-4",
  default: "p-5",
  featured: "p-6 sm:p-8",
};

const textClass: Record<PredictionCardSize, string> = {
  compact: "text-sm leading-relaxed",
  default: "text-base leading-relaxed",
  featured: "text-lg leading-relaxed sm:text-xl",
};

export const PredictionCard = memo(function PredictionCard({
  prediction: p,
  size = "default",
  linkSource = true,
  scoreSlot,
  footerSlot,
  showCreatedAt = false,
  className = "",
}: PredictionCardProps) {
  const pad = sizeClass[size];
  const quoteClass = `font-medium text-zinc-900 dark:text-zinc-50 ${textClass[size]}`;

  const sourceBody = linkSource ? (
    <Link
      href={`/source/${encodeURIComponent(p.sourceSlug)}`}
      className="text-zinc-900 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-zinc-50 dark:focus-visible:ring-zinc-500 dark:focus-visible:ring-offset-zinc-900"
    >
      {p.source}
    </Link>
  ) : (
    <span className="text-zinc-900 dark:text-zinc-50">{p.source}</span>
  );

  return (
    <article
      className={`rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${pad} ${className}`.trim()}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-4">
          <p className={quoteClass}>{p.text}</p>
          <dl className="grid gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
              <dt className="font-medium text-zinc-500 dark:text-zinc-400">
                Source
              </dt>
              <dd className="min-w-0">{sourceBody}</dd>
              <dt className="font-medium text-zinc-500 dark:text-zinc-400">
                Category
              </dt>
              <dd>{p.category?.trim() ? p.category : "—"}</dd>
              <dt className="font-medium text-zinc-500 dark:text-zinc-400">
                Target date
              </dt>
              <dd>
                {p.target_date ? formatMonthYear(p.target_date) : "—"}
              </dd>
              {showCreatedAt ? (
                <>
                  <dt className="font-medium text-zinc-500 dark:text-zinc-400">
                    Added
                  </dt>
                  <dd>{formatIsoDate(p.created_at)}</dd>
                </>
              ) : null}
            </div>
          </dl>
          {scoreSlot ? (
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              {scoreSlot}
            </div>
          ) : null}
        </div>
        <div className="flex shrink-0 sm:justify-end">
          <OutcomeBadge outcome={p.outcome} />
        </div>
      </div>
      {footerSlot ? (
        <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          {footerSlot}
        </div>
      ) : null}
    </article>
  );
});
