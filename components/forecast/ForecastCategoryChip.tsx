'use client';

import Link from 'next/link';
import { memo } from 'react';
import { categoryDisplayFromName } from '@/lib/category-display';
import { categoryTabFromName } from '@/lib/category-tabs';
import { categoryToSlug } from '@/types/category';

type ForecastCategoryChipProps = {
  category: string | null | undefined;
  className?: string;
};

const chipLinkClass
  = 'group inline-flex min-h-11 min-w-0 max-w-full items-center gap-2.5 rounded-lg text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background';

const chipStaticClass = 'inline-flex min-w-0 max-w-full items-center gap-2.5';

const labelLinkClass
  = 'truncate text-xs font-semibold tracking-wide text-muted transition-colors group-hover:text-interactive group-hover:underline underline-offset-2';

const labelStaticClass
  = 'truncate text-xs font-semibold tracking-wide text-muted';

export const ForecastCategoryChip = memo(function ForecastCategoryChip({
  category,
  className = '',
}: ForecastCategoryChipProps) {
  const display = categoryDisplayFromName(category);
  const tab = categoryTabFromName(category);
  const href
    = tab && tab !== 'All' ? `/category/${categoryToSlug(tab)}` : undefined;

  const icon = (
    <span
      className={`inline-flex size-8 shrink-0 items-center justify-center rounded-lg ${display.iconWrapClass}`}
      aria-hidden
    >
      {display.icon}
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`${chipLinkClass} ${className}`.trim()}
        aria-label={`Browse ${tab} forecasts`}
      >
        {icon}
        <span className={labelLinkClass}>
          {display.label}
        </span>
      </Link>
    );
  }

  return (
    <span className={`${chipStaticClass} ${className}`.trim()}>
      {icon}
      <span className={labelStaticClass}>
        {display.label}
      </span>
    </span>
  );
});
