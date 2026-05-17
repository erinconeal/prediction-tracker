"use client";

import { memo } from "react";
import { ForecastCardFooter } from "@/components/forecast/ForecastCardFooter";
import { ForecastCardShell } from "@/components/forecast/ForecastCardShell";
import { ForecastCardTitle } from "@/components/forecast/ForecastCardTitle";
import { ForecastCategoryChip } from "@/components/forecast/ForecastCategoryChip";
import { OutcomeFilterButton } from "@/components/predictions/OutcomeFilterButton";
import { formatIsoDate, formatMonthYear } from "@/utils/format-date";
import type { Outcome, Prediction } from "@/types/prediction";
import type { TopicTab } from "@/lib/topic-tabs";
import { truncateWithEllipsis } from "@/utils/truncate-text";

type BrowseForecastCardProps = {
  prediction: Prediction;
  outcomeFilter: Outcome | "all";
  onOutcomeFilter: (outcome: Outcome) => void;
  onCategorySelect?: (tab: TopicTab) => void;
  className?: string;
};

export const BrowseForecastCard = memo(function BrowseForecastCard({
  prediction: p,
  outcomeFilter,
  onOutcomeFilter,
  onCategorySelect,
  className = "",
}: BrowseForecastCardProps) {
  const secondaryLine = p.target_date
    ? `Target ${formatMonthYear(p.target_date)}`
    : `Added ${formatIsoDate(p.created_at)}`;

  return (
    <ForecastCardShell
      className={className}
      headerStart={
        <ForecastCategoryChip
          category={p.category}
          onCategorySelect={onCategorySelect}
        />
      }
      headerEnd={
        <OutcomeFilterButton
          outcome={p.outcome}
          pressed={outcomeFilter === p.outcome}
          onFilter={onOutcomeFilter}
        />
      }
      title={
        <ForecastCardTitle
          predictionId={p.id}
          text={truncateWithEllipsis(p.text, 160)}
        />
      }
      footer={
        <ForecastCardFooter
          sourceName={p.source}
          sourceSlug={p.sourceSlug}
          secondaryLine={secondaryLine}
        />
      }
    />
  );
});
