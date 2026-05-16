"use client";

import { memo, useId } from "react";
import {
  TOPIC_TAB_VALUES,
  type TopicTab,
} from "@/lib/topic-tabs";

export { TOPIC_TAB_VALUES, type TopicTab };

type CategoryTopicTabsProps = {
  active: TopicTab;
  onChange: (tab: TopicTab) => void;
  disabled?: boolean;
  /** When false, topic chips sit inline under a section title without a fieldset legend. */
  showLegend?: boolean;
  className?: string;
};

export const CategoryTopicTabs = memo(function CategoryTopicTabs({
  active,
  onChange,
  disabled = false,
  showLegend = true,
  className = "",
}: CategoryTopicTabsProps) {
  const name = `category-topic-${useId()}`;

  const chips = (
    <div className={`flex flex-wrap gap-2 ${showLegend ? "mt-1.5" : ""}`.trim()}>
      {TOPIC_TAB_VALUES.map((tab) => {
        const isActive = tab === active;
        return (
          <label
            key={tab}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-interactive focus-within:ring-offset-2 focus-within:ring-offset-background ${
              disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
            } ${
              isActive
                ? "bg-interactive text-white shadow-sm"
                : "border border-border bg-surface-elevated text-foreground hover:border-border hover:bg-surface"
            }`}
          >
            <input
              type="radio"
              className="sr-only"
              name={name}
              value={tab}
              checked={isActive}
              disabled={disabled}
              onChange={() => onChange(tab)}
            />
            {tab}
          </label>
        );
      })}
    </div>
  );

  if (!showLegend) {
    return <div className={`min-w-0 ${className}`.trim()}>{chips}</div>;
  }

  return (
    <fieldset className={`min-w-0 border-0 p-0 ${className}`.trim()}>
      <legend className="text-xs font-medium text-muted">Topics</legend>
      {chips}
    </fieldset>
  );
});

export { categoryFromTopicTab } from "@/lib/topic-tabs";
