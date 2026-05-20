'use client';

import { memo } from 'react';
import type { PredictionListSort } from '@/types/prediction';

const SORT_TABS: { value: PredictionListSort; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'source_accuracy', label: 'Most accurate source' },
  { value: 'recently_resolved', label: 'Recently resolved' },
];

type PredictionSortTabsProps = {
  value: PredictionListSort;
  onChange: (sort: PredictionListSort) => void;
  disabled?: boolean;
  className?: string;
};

export const PredictionSortTabs = memo(function PredictionSortTabs({
  value,
  onChange,
  disabled = false,
  className = '',
}: PredictionSortTabsProps) {
  return (
    <fieldset
      className={`min-w-0 border-0 p-0 ${className}`.trim()}
    >
      <legend className="text-xs font-medium text-muted">Sort by</legend>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {SORT_TABS.map((tab) => {
          const isActive = tab.value === value;
          return (
            <label
              key={tab.value}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-interactive focus-within:ring-offset-2 focus-within:ring-offset-background ${
                disabled
                  ? 'cursor-not-allowed opacity-50'
                  : 'cursor-pointer'
              } ${
                isActive
                  ? 'bg-primary text-white shadow-sm'
                  : 'border border-border bg-surface-elevated text-foreground hover:border-border hover:bg-surface'
              }`}
            >
              <input
                type="radio"
                className="sr-only"
                name="prediction-list-sort"
                value={tab.value}
                checked={isActive}
                disabled={disabled}
                onChange={() => onChange(tab.value)}
              />
              {tab.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
});

export function sortSubtitle(sort: PredictionListSort): string {
  switch (sort) {
    case 'newest':
      return 'Newest first. Open a card for timeline and source stats.';
    case 'source_accuracy':
      return 'Higher constitution accuracy per source first (correct ÷ scored). Open a card for details.';
    case 'recently_resolved':
      return 'Recently resolved first, then newest pending. Open a card for details.';
  }
}
