/** Matches `PopularForecastsSection` grid: 1 col default, 3 at lg, 4 at xl. */
export const FEATURED_FORECAST_GRID_CLASS =
  "grid list-none gap-4 lg:grid-cols-3 xl:grid-cols-4";

export const FEATURED_FORECAST_MAX_SLOTS = 4;

const LG_MIN_WIDTH_PX = 1024;
const XL_MIN_WIDTH_PX = 1280;

/** How many featured cards fit on one row at the given viewport width. */
export function featuredForecastSlotCount(viewportWidth: number): number {
  if (viewportWidth >= XL_MIN_WIDTH_PX) return 4;
  if (viewportWidth >= LG_MIN_WIDTH_PX) return 3;
  return 1;
}
