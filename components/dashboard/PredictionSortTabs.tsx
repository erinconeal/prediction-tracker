'use client';

import { memo } from 'react';
import type { PredictionListSort } from '@/types/prediction';
import { ArrowDownWideNarrow } from 'lucide-react';
import { InfoPopover } from '@/components/ui/InfoPopover';
import {
  SORT_RECENTLY_FINISHED,
  SORT_RECENTLY_FINISHED_HINT,
} from '@/lib/lifecycle-copy';

const SORT_TABS: { value: PredictionListSort; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'source_accuracy', label: 'Most accurate source' },
  { value: 'recently_finished', label: SORT_RECENTLY_FINISHED },
];

type PredictionSortTabsProps = {
  id?: string;
  value: PredictionListSort;
  onChange: (sort: PredictionListSort) => void;
  disabled?: boolean;
  className?: string;
  hideLegend?: boolean;
};

export const PredictionSortTabs = memo(function PredictionSortTabs({
  id,
  value,
  onChange,
  disabled = false,
  className = '',
  hideLegend = false,
}: PredictionSortTabsProps) {
  return (
    <fieldset
      id={id}
      className={`min-w-0 border-0 p-0 ${className}`.trim()}
      aria-label={hideLegend ? 'Sort by' : undefined}
    >
      {hideLegend
        ? null
        : (
            <legend className="text-xs font-medium text-muted">
              Sort by
            </legend>
          )}
      <div className={`flex flex-wrap gap-2 ${hideLegend ? '' : 'mt-1.5'}`.trim()}>
        {SORT_TABS.map((tab) => {
          const isActive = tab.value === value;
          const pillClassName = `inline-flex items-center rounded-full text-sm font-medium transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-interactive focus-within:ring-offset-2 focus-within:ring-offset-background ${
            disabled
              ? 'cursor-not-allowed opacity-50'
              : ''
          } ${
            isActive
              ? 'bg-primary text-white shadow-sm'
              : 'border border-border bg-surface-elevated text-foreground hover:border-border hover:bg-surface'
          }`;

          return (
            <div key={tab.value} className={pillClassName}>
              <label
                className={`inline-flex cursor-pointer items-center gap-1.5 px-3.5 py-1.5 ${
                  disabled ? 'cursor-not-allowed' : ''
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
                {isActive
                  ? (
                      <ArrowDownWideNarrow
                        className="size-4"
                        aria-hidden
                        strokeWidth={1.75}
                      />
                    )
                  : null}
              </label>
              {tab.value === 'recently_finished'
                ? (
                    <InfoPopover
                      label={`About ${SORT_RECENTLY_FINISHED} sort`}
                      tone={isActive ? 'onPrimary' : 'default'}
                      className="me-2 self-center"
                    >
                      {SORT_RECENTLY_FINISHED_HINT}
                    </InfoPopover>
                  )
                : null}
            </div>
          );
        })}
      </div>
    </fieldset>
  );
});

export function sortOptionLabel(sort: PredictionListSort): string {
  return SORT_TABS.find(tab => tab.value === sort)?.label ?? 'Newest';
}

export function sortSubtitle(sort: PredictionListSort): string {
  switch (sort) {
    case 'newest':
      return 'Newest first. Open a card for timeline and source stats.';
    case 'source_accuracy':
      return 'Higher constitution accuracy per source first (correct ÷ scored). Open a card for details.';
    case 'recently_finished':
      return `${SORT_RECENTLY_FINISHED} first, then still-open forecasts. Open a card for details.`;
  }
}
