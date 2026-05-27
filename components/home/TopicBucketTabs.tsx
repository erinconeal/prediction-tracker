'use client';

import { memo, useId } from 'react';
import {
  TOPIC_BUCKET_TAB_VALUES,
  type TopicBucketTab,
} from '@/lib/topic-tabs';

export { TOPIC_BUCKET_TAB_VALUES, type TopicBucketTab };

type TopicBucketTabsProps = {
  active: TopicBucketTab;
  onChange: (tab: TopicBucketTab) => void;
  disabled?: boolean;
  /** When false, chips sit inline without a fieldset legend. */
  showLegend?: boolean;
  className?: string;
};

export const TopicBucketTabs = memo(function TopicBucketTabs({
  active,
  onChange,
  disabled = false,
  showLegend = true,
  className = '',
}: TopicBucketTabsProps) {
  const name = `topic-bucket-tabs-${useId()}`;

  const chips = (
    <div className={`flex flex-wrap gap-2 ${showLegend ? 'mt-1.5' : ''}`.trim()}>
      {TOPIC_BUCKET_TAB_VALUES.map((tab) => {
        const isActive = tab === active;
        return (
          <label
            key={tab}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-interactive focus-within:ring-offset-2 focus-within:ring-offset-background ${
              disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
            } ${
              isActive
                ? 'bg-interactive text-white shadow-sm'
                : 'border border-border bg-surface-elevated text-foreground hover:border-border hover:bg-surface'
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
    return <div className={className}>{chips}</div>;
  }

  return (
    <fieldset className={`border-0 p-0 ${className}`.trim()}>
      <legend className="text-sm font-semibold text-foreground">Browse by topic</legend>
      {chips}
    </fieldset>
  );
});
