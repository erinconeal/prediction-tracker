"use client";

import { memo, useId } from "react";

/** Topic filters aligned with demo seed and common categories. */
export const TOPIC_TAB_VALUES = [
  "All",
  "Economics",
  "Tech",
  "Sports",
  "Politics",
  "Finance",
] as const;

export type TopicTab = (typeof TOPIC_TAB_VALUES)[number];

type CategoryTopicTabsProps = {
  active: TopicTab;
  onChange: (tab: TopicTab) => void;
  disabled?: boolean;
  className?: string;
};

export const CategoryTopicTabs = memo(function CategoryTopicTabs({
  active,
  onChange,
  disabled = false,
  className = "",
}: CategoryTopicTabsProps) {
  const name = `category-topic-${useId()}`;

  return (
    <fieldset
      className={`min-w-0 border-0 p-0 ${className}`.trim()}
    >
      <legend className="text-xs font-medium text-muted">Topics</legend>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {TOPIC_TAB_VALUES.map((tab) => {
          const isActive = tab === active;
          return (
            <label
              key={tab}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-interactive focus-within:ring-offset-2 focus-within:ring-offset-background ${
                disabled
                  ? "cursor-not-allowed opacity-50"
                  : "cursor-pointer"
              } ${
                isActive
                  ? "bg-primary text-white shadow-sm"
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
    </fieldset>
  );
});

export function categoryFromTopicTab(tab: TopicTab): string | undefined {
  return tab === "All" ? undefined : tab;
}
