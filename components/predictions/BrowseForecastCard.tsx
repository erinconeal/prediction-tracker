"use client";

import { memo } from "react";
import { ForecastCardFooter } from "@/components/forecast/ForecastCardFooter";
import { ForecastCardShell } from "@/components/forecast/ForecastCardShell";
import { ForecastCardTitle } from "@/components/forecast/ForecastCardTitle";
import { ForecastCategoryChip } from "@/components/forecast/ForecastCategoryChip";
import { ForecastTopicChip } from "@/components/forecast/ForecastTopicChip";
import { OutcomeFilterButton } from "@/components/predictions/OutcomeFilterButton";
import { categoryTabFromName, type CategoryTab } from "@/lib/category-tabs";
import { formatIsoDate, formatMonthYear } from "@/utils/format-date";
import type { Outcome, Prediction } from "@/types/prediction";
import { truncateWithEllipsis } from "@/utils/truncate-text";

type BrowseForecastCardProps = {
  prediction: Prediction;
  outcomeFilter: Outcome | "all";
  onOutcomeFilter: (outcome: Outcome) => void;
  onCategorySelect?: (tab: CategoryTab) => void;
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

  const tab = categoryTabFromName(p.category);

  return (
    <ForecastCardShell
      className={className}
      headerStart={
        <div className="flex min-w-0 flex-col gap-2">
          <ForecastCategoryChip
            category={p.category}
            onCategoryNavigate={
              onCategorySelect && tab
                ? () => onCategorySelect(tab)
                : undefined
            }
          />
          <ForecastTopicChip topicIds={p.topicIds} />
        </div>
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
