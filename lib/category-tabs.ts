import {
  CATEGORIES,
  type Category,
  categoryFromSlug,
} from "@/types/category";

/** Category filters for home chips and browse (excludes "All"). */
export const CATEGORY_TAB_VALUES = ["All", ...CATEGORIES] as const;

export type CategoryTab = (typeof CATEGORY_TAB_VALUES)[number];

export function categoryFromCategoryTab(
  tab: CategoryTab,
): Category | undefined {
  return tab === "All" ? undefined : tab;
}

/** Maps a stored category string to a tab when it matches the allowlist. */
export function categoryTabFromName(
  category: string | null | undefined,
): CategoryTab | undefined {
  const raw = category?.trim();
  if (!raw) return undefined;
  const lower = raw.toLowerCase();
  for (const tab of CATEGORY_TAB_VALUES) {
    if (tab === "All") continue;
    if (tab.toLowerCase() === lower) return tab;
  }
  return undefined;
}

export { categoryFromSlug };
