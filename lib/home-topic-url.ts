import type { TopicBucketTab } from '@/lib/topic-tabs';
import {
  topicBucketTabFromSlug,
  topicSlugFromBucketTab,
} from '@/lib/topic-tabs';
import { topicPagePath } from '@/lib/topic-path';
import type { TopicKind } from '@/types/topic';

/** Maps `?topic=` slug on the home page to an active bucket tab. */
export function topicBucketTabFromSearchParam(
  value: string | null | undefined,
): TopicBucketTab | undefined {
  return topicBucketTabFromSlug(value);
}

/** Query value for `?topic=` when the tab is not All. */
export function homeTopicQueryValue(tab: TopicBucketTab): string | null {
  if (tab === 'All') return null;
  return topicSlugFromBucketTab(tab) ?? null;
}

export type HomeTopicQueryResolution
  = | { kind: 'tab'; tab: TopicBucketTab }
    | { kind: 'redirect'; href: string }
    | { kind: 'strip' };

/** Looks up a topic by slug without importing the SQLite layer. */
export type TopicSlugLookup = (
  slug: string,
) => Promise<{ slug: string; kind: TopicKind } | null>;

/**
 * Resolves `?topic=` from URL to tab/redirect/strip.
 * Redirects to stable URL, strips `?topic=` when not tab.
 * Callers supply a lookup so this module stays browser-safe.
 */
export async function resolveHomeTopicQuery(
  raw: string | null | undefined,
  lookupTopic: TopicSlugLookup,
): Promise<HomeTopicQueryResolution> {
  const value = raw?.trim();
  if (!value) {
    return { kind: 'tab', tab: 'All' };
  }

  const tab = topicBucketTabFromSearchParam(value);
  if (tab) {
    return { kind: 'tab', tab };
  }

  const topic = await lookupTopic(value);
  if (topic && topic.kind === 'curated') {
    return { kind: 'redirect', href: topicPagePath(topic.slug) };
  }

  return { kind: 'strip' };
}

/** Home path with optional `topic` query for shareable browse filters. */
export function buildHomeBrowseHref(
  pathname: string,
  tab: TopicBucketTab,
  existingParams?: URLSearchParams,
): string {
  const params = new URLSearchParams(existingParams?.toString() ?? '');
  const queryValue = homeTopicQueryValue(tab);
  if (queryValue === null) {
    params.delete('topic');
  }
  else {
    params.set('topic', queryValue);
  }
  const qs = params.toString();
  return qs ? `${pathname}?${qs}` : pathname;
}
