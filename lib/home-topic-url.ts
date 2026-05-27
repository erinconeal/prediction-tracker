import type { TopicBucketTab } from '@/lib/topic-tabs';
import {
  topicBucketTabFromSlug,
  topicSlugFromBucketTab,
} from '@/lib/topic-tabs';
import { topicPagePath } from '@/lib/topic-path';
import { getTopicBySlug } from '@/lib/topic-store';

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

export function resolveHomeTopicQuery(
  raw: string | null | undefined,
): HomeTopicQueryResolution {
  const value = raw?.trim();
  if (!value) {
    return { kind: 'tab', tab: 'All' };
  }

  const tab = topicBucketTabFromSearchParam(value);
  if (tab) {
    return { kind: 'tab', tab };
  }

  const topic = getTopicBySlug(value);
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
