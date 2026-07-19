import type { TopicBucketTab } from '@/lib/topic-tabs';
import {
  topicBucketTabFromSlug,
  topicSlugFromBucketTab,
} from '@/lib/topic-tabs';
import { topicPagePath } from '@/lib/topic-path';
import { getTopicBySlug } from '@/lib/repositories/topic-repository';

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

/**
 * Resolves `?topic=` from URL to tab/redirect/strip
 * Redirects to stable URL, strips `?topic=` when not tab
 */
export async function resolveHomeTopicQuery(
  raw: string | null | undefined,
): Promise<HomeTopicQueryResolution> {
  const value = raw?.trim();
  if (!value) {
    return { kind: 'tab', tab: 'All' };
  }

  const tab = topicBucketTabFromSearchParam(value);
  if (tab) {
    return { kind: 'tab', tab };
  }

  const topic = await getTopicBySlug(value);
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
