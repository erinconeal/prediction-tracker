"use client";

import { memo } from "react";

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
  return (
    <div
      className={`flex flex-wrap gap-2 ${className}`.trim()}
      role="tablist"
      aria-label="Topics"
    >
      {TOPIC_TAB_VALUES.map((tab) => {
        const isActive = tab === active;
        return (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={isActive}
            disabled={disabled}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 dark:focus-visible:ring-offset-zinc-950 ${
              isActive
                ? "bg-blue-600 text-white shadow-sm dark:bg-blue-600"
                : "border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-zinc-600 dark:hover:bg-zinc-800"
            }`}
            onClick={() => onChange(tab)}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
});

export function categoryFromTopicTab(tab: TopicTab): string | undefined {
  return tab === "All" ? undefined : tab;
}
