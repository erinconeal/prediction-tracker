'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  buildHomeBrowseHref,
  resolveHomeTopicQuery,
  topicBucketTabFromSearchParam,
  type HomeTopicQueryResolution,
} from '@/lib/home-topic-url';
import {
  topicSlugFromBucketTab,
  type TopicBucketTab,
} from '@/lib/topic-tabs';

/** Hook state: settled resolution, or pending while curated/unknown slug is looked up. */
export type HomeTopicQueryState
  = | HomeTopicQueryResolution
    | { kind: 'pending' };

export type UseHomeTopicQueryResult = {
  topicResolution: HomeTopicQueryState;
  topicTab: TopicBucketTab;
  topicSlug: string | undefined;
  /** True when `?topic=` resolves to a stable home bucket tab (not redirect/strip). */
  isFeedReady: boolean;
};

/**
 * Sync path for empty/`?topic=` bucket tabs (no DB). Non-bucket slugs stay pending
 * until `resolveHomeTopicQuery` finishes (redirect or strip).
 */
function syncTopicResolution(
  rawTopic: string | null,
): HomeTopicQueryState {
  const value = rawTopic?.trim();
  if (!value) {
    return { kind: 'tab', tab: 'All' };
  }
  const tab = topicBucketTabFromSearchParam(value);
  if (tab) {
    return { kind: 'tab', tab };
  }
  return { kind: 'pending' };
}

/**
 * Hook to provide topicResolution, topicTab, topicSlug and isFeedReady to parent DashboardView
 * Reads `?topic=` from URL, resolves to tab/slug/redirect/strip
 * Redirects to stable URL, strips `?topic=` when not tab
 * Gates feed fetches until URL is stable
 */
export function useHomeTopicQuery(): UseHomeTopicQueryResult {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawTopic = searchParams.get('topic');

  const syncResolution = useMemo(
    () => syncTopicResolution(rawTopic),
    [rawTopic],
  );

  /** Async redirect/strip result, keyed by slug so stale lookups are ignored. */
  const [asyncLookup, setAsyncLookup] = useState<{
    slug: string;
    resolution: HomeTopicQueryResolution;
  } | null>(null);

  useEffect(() => {
    if (syncResolution.kind !== 'pending') return;

    const slug = rawTopic?.trim();
    if (!slug) return;

    let cancelled = false;

    void (async () => {
      const resolution = await resolveHomeTopicQuery(rawTopic);
      if (!cancelled) setAsyncLookup({ slug, resolution });
    })();

    return () => {
      cancelled = true;
    };
  }, [rawTopic, syncResolution.kind]);

  const topicResolution = useMemo((): HomeTopicQueryState => {
    if (syncResolution.kind !== 'pending') {
      return syncResolution;
    }
    const slug = rawTopic?.trim();
    if (asyncLookup && asyncLookup.slug === slug) {
      return asyncLookup.resolution;
    }
    return { kind: 'pending' };
  }, [asyncLookup, rawTopic, syncResolution]);

  const topicTab: TopicBucketTab
    = topicResolution.kind === 'tab' ? topicResolution.tab : 'All';

  const topicSlug = topicSlugFromBucketTab(topicTab);

  const isFeedReady = topicResolution.kind === 'tab';

  useEffect(() => {
    if (topicResolution.kind === 'redirect') {
      router.replace(topicResolution.href, { scroll: false });
      return;
    }
    if (topicResolution.kind === 'strip') {
      router.replace(buildHomeBrowseHref(pathname, 'All', searchParams), {
        scroll: false,
      });
    }
  }, [pathname, router, searchParams, topicResolution]);

  return {
    topicResolution,
    topicTab,
    topicSlug,
    isFeedReady,
  };
}
