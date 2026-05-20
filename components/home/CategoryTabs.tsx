'use client';

import { memo, useId } from 'react';
import {
  CATEGORY_TAB_VALUES,
  type CategoryTab,
} from '@/lib/category-tabs';

export { CATEGORY_TAB_VALUES, type CategoryTab };

type CategoryTabsProps = {
  active: CategoryTab;
  onChange: (tab: CategoryTab) => void;
  disabled?: boolean;
  /** When false, chips sit inline without a fieldset legend. */
  showLegend?: boolean;
  className?: string;
};

export const CategoryTabs = memo(function CategoryTabs({
  active,
  onChange,
  disabled = false,
  showLegend = true,
  className = '',
}: CategoryTabsProps) {
  const name = `category-tabs-${useId()}`;

  const chips = (
    <div className={`flex flex-wrap gap-2 ${showLegend ? 'mt-1.5' : ''}`.trim()}>
      {CATEGORY_TAB_VALUES.map((tab) => {
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
    return <div className={`min-w-0 ${className}`.trim()}>{chips}</div>;
  }

  return (
    <fieldset className={`min-w-0 border-0 p-0 ${className}`.trim()}>
      <legend className="text-xs font-medium text-muted">Categories</legend>
      {chips}
    </fieldset>
  );
});

export { categoryFromCategoryTab } from '@/lib/category-tabs';
