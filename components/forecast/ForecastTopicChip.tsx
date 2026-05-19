"use client";

import Link from "next/link";
import { memo } from "react";
import { useTopicCatalog } from "@/hooks/useTopicCatalog";
import { truncateWithEllipsis } from "@/utils/truncate-text";

type ForecastTopicChipProps = {
  topicIds: string[];
  className?: string;
};

export const ForecastTopicChip = memo(function ForecastTopicChip({
  topicIds,
  className = "",
}: ForecastTopicChipProps) {
  const { getTopicsByIds } = useTopicCatalog();
  const topics = getTopicsByIds(topicIds);
  if (topics.length === 0) return null;

  const primary = topics[0]!;
  const extra = topics.length - 1;

  return (
    <Link
      href={`/topics/${primary.slug}`}
      className={`inline-flex min-h-11 max-w-full items-center rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-medium text-interactive hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background ${className}`.trim()}
    >
      <span className="truncate">{truncateWithEllipsis(primary.name, 48)}</span>
      {extra > 0 ? (
        <span className="ms-1 shrink-0 text-muted">+{extra}</span>
      ) : null}
    </Link>
  );
});
