import type { Prediction } from "@/types/prediction";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const DEFAULT_MAX_FEATURED_SLIDES = 8;

export const SPOTLIGHT_TITLE_WEEK = "Top predictions this week";
export const SPOTLIGHT_TITLE_FALLBACK = "Featured highlights";

function isCreatedInRollingWeek(createdAtIso: string, now: Date): boolean {
  const t = new Date(createdAtIso).getTime();
  if (Number.isNaN(t)) return false;
  return t >= now.getTime() - WEEK_MS;
}

export type PickFeaturedFromFeedResult = {
  slides: Prediction[];
  spotlightTitle: string;
};

/**
 * Picks carousel slides: prefer items from the last 7 days (feed order), then
 * backfill from the rest of the feed so the carousel stays full.
 */
export function pickFeaturedFromFeed(
  data: Prediction[],
  max: number = DEFAULT_MAX_FEATURED_SLIDES,
  now: Date = new Date(),
): PickFeaturedFromFeedResult {
  if (data.length === 0) {
    return { slides: [], spotlightTitle: SPOTLIGHT_TITLE_FALLBACK };
  }

  const inWeek = data.filter((p) => isCreatedInRollingWeek(p.created_at, now));
  const seen = new Set<string>();
  const slides: Prediction[] = [];

  for (const p of inWeek) {
    if (slides.length >= max) break;
    seen.add(p.id);
    slides.push(p);
  }

  if (slides.length < max) {
    for (const p of data) {
      if (slides.length >= max) break;
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      slides.push(p);
    }
  }

  const spotlightTitle = slides.some((p) =>
    isCreatedInRollingWeek(p.created_at, now),
  )
    ? SPOTLIGHT_TITLE_WEEK
    : SPOTLIGHT_TITLE_FALLBACK;

  return { slides, spotlightTitle };
}
