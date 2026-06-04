'use client';

import { memo, useId } from 'react';
import { OUTCOME_STILL_OPEN_LABEL } from '@/lib/lifecycle-copy';
import type { SourceFeedStatusFilter } from '@/lib/source-feed-empty-message';

const FEED_STATUS_TABS: { value: SourceFeedStatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'still_open', label: OUTCOME_STILL_OPEN_LABEL },
];

type SourceFeedStatusFilterControlProps = {
  id?: string;
  value: SourceFeedStatusFilter;
  onChange: (value: SourceFeedStatusFilter) => void;
  disabled?: boolean;
  className?: string;
};

export const SourceFeedStatusFilterControl = memo(
  function SourceFeedStatusFilterControl({
    id,
    value,
    onChange,
    disabled = false,
    className = '',
  }: SourceFeedStatusFilterControlProps) {
    const radioGroupName = `source-feed-status-filter-${useId()}`;

    return (
      <fieldset
        id={id}
        className={`min-w-0 border-0 p-0 ${className}`.trim()}
      >
        <legend className="sr-only">Filter prediction feed by status</legend>
        <div className="inline-grid grid-cols-2 gap-2">
          {FEED_STATUS_TABS.map((tab) => {
            const isActive = tab.value === value;

            return (
              <label
                key={tab.value}
                className={`inline-flex min-h-11 w-full cursor-pointer items-center justify-center rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-interactive focus-within:ring-offset-2 focus-within:ring-offset-background ${
                  disabled ? 'cursor-not-allowed opacity-50' : ''
                } ${
                  isActive
                    ? 'bg-interactive text-white shadow-sm'
                    : 'border border-border bg-surface-elevated text-foreground hover:border-border hover:bg-surface'
                }`}
              >
                <input
                  type="radio"
                  className="sr-only"
                  name={radioGroupName}
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
  },
);
