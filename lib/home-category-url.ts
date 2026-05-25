import type { CategoryTab } from '@/lib/category-tabs';
import { categoryFromSlug, categoryToSlug } from '@/types/category';

/** Maps `?category=` slug on the home page to an active category tab. */
export function categoryTabFromSearchParam(
  value: string | null | undefined,
): CategoryTab | undefined {
  if (value === null || value === undefined || value.trim() === '') {
    return undefined;
  }
  const category = categoryFromSlug(value);
  return category ?? undefined;
}

/** Query value for `?category=` when the tab is not All. */
export function homeCategoryQueryValue(tab: CategoryTab): string | null {
  if (tab === 'All') return null;
  return categoryToSlug(tab);
}

/** Home path with optional `category` query for shareable browse filters. */
export function buildHomeBrowseHref(
  pathname: string,
  tab: CategoryTab,
  existingParams?: URLSearchParams,
): string {
  const params = new URLSearchParams(existingParams?.toString() ?? '');
  const queryValue = homeCategoryQueryValue(tab);
  if (queryValue === null) {
    params.delete('category');
  }
  else {
    params.set('category', queryValue);
  }
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}
