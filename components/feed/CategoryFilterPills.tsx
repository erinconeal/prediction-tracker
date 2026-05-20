'use client';

import Link from 'next/link';
import { memo } from 'react';
import { CATEGORIES, categoryToSlug, type Category } from '@/types/category';

type CategoryFilterPillsProps = {
  activeCategory: Category;
  className?: string;
};

export const CategoryFilterPills = memo(function CategoryFilterPills({
  activeCategory,
  className = '',
}: CategoryFilterPillsProps) {
  return (
    <section
      className={`rounded-xl border border-border bg-surface-elevated p-4 shadow-sm ${className}`.trim()}
      aria-labelledby="category-filters-heading"
    >
      <h2
        id="category-filters-heading"
        className="flex items-center gap-2 text-sm font-semibold text-foreground"
      >
        <span className="text-muted" aria-hidden>
          ⏷
        </span>
        Filters
      </h2>
      <ul className="mt-3 flex list-none flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const isActive = cat === activeCategory;
          return (
            <li key={cat}>
              <Link
                href={`/category/${categoryToSlug(cat)}`}
                className={`inline-flex min-h-11 items-center rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  isActive
                    ? 'bg-interactive text-white shadow-sm'
                    : 'border border-border bg-surface text-foreground hover:bg-surface-elevated'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {cat}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
});
