'use client';

import Link from 'next/link';
import { memo } from 'react';
import { categoryDisplayFromName } from '@/lib/category-display';
import { categoryTabFromName } from '@/lib/category-tabs';
import { categoryToSlug } from '@/types/category';
import { forecastCardLinkClass } from './forecast-card-tokens';

type ForecastCategoryLinkProps = {
  category: string | null | undefined;
  className?: string;
};

const linkClass
  = `inline items-center text-xs font-normal uppercase text-muted ${forecastCardLinkClass}`;

const staticClass = 'text-xs font-normal uppercase text-muted';

export const ForecastCategoryLink = memo(function ForecastCategoryLink({
  category,
  className = '',
}: ForecastCategoryLinkProps) {
  const display = categoryDisplayFromName(category);
  const tab = categoryTabFromName(category);
  const href
    = tab && tab !== 'All' ? `/category/${categoryToSlug(tab)}` : undefined;

  if (href) {
    return (
      <Link
        href={href}
        className={`${linkClass} ${className}`.trim()}
        aria-label={`Browse ${tab} forecasts`}
      >
        {display.label}
      </Link>
    );
  }

  return (
    <span className={`${staticClass} ${className}`.trim()}>
      {display.label}
    </span>
  );
});
