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
  compact: "text-base leading-snug",
  default: "text-lg leading-snug",
  featured: "text-xl leading-snug sm:text-2xl",
};

const linkSourceClass =
  "text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:text-zinc-400 dark:hover:text-zinc-100 dark:focus-visible:ring-zinc-500 dark:focus-visible:ring-offset-zinc-900";

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
  const quoteClass = `font-semibold text-zinc-900 dark:text-zinc-50 ${textClass[size]}`;

  const sourceBody = linkSource ? (
    <Link
      href={`/source/${encodeURIComponent(p.sourceSlug)}`}
      className={linkSourceClass}
    >
      {p.source}
    </Link>
  ) : (
    <span className="text-zinc-600 dark:text-zinc-400">{p.source}</span>
  );

  const dtClass =
    "font-normal uppercase tracking-wide text-zinc-400 dark:text-zinc-500";
  const ddClass = "text-zinc-600 dark:text-zinc-400";
  const categoryDdClass = "text-zinc-500 dark:text-zinc-500";

  return (
    <article
      className={`rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${pad} ${className}`.trim()}
    >
      <div className="min-w-0 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <p className={`min-w-0 flex-1 ${quoteClass}`}>{p.text}</p>
          <OutcomeBadge outcome={p.outcome} className="shrink-0" />
        </div>
        <dl className="grid gap-2 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
            <dt className={dtClass}>Source</dt>
            <dd className={`min-w-0 ${ddClass}`}>{sourceBody}</dd>
            <dt className={dtClass}>Category</dt>
            <dd className={categoryDdClass}>
              {p.category?.trim() ? p.category : "—"}
            </dd>
            <dt className={dtClass}>Target date</dt>
            <dd className={ddClass}>
              {p.target_date ? formatMonthYear(p.target_date) : "—"}
            </dd>
            {showCreatedAt ? (
              <>
                <dt className={dtClass}>Added</dt>
                <dd className={ddClass}>{formatIsoDate(p.created_at)}</dd>
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
      {footerSlot ? (
        <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
          {footerSlot}
        </div>
      ) : null}
    </article>
  );
});
