'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo } from 'react';
import {
  buildHomeBrowseHref,
  resolveHomeTopicQuery,
  type HomeTopicQueryResolution,
} from '@/lib/home-topic-url';
import {
  topicSlugFromBucketTab,
  type TopicBucketTab,
} from '@/lib/topic-tabs';

export type UseHomeTopicQueryResult = {
  topicResolution: HomeTopicQueryResolution;
  topicTab: TopicBucketTab;
  topicSlug: string | undefined;
  /** True when `?topic=` resolves to a stable home bucket tab (not redirect/strip). */
  isFeedReady: boolean;
};

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

  const topicResolution = useMemo(
    () => resolveHomeTopicQuery(searchParams.get('topic')),
    [searchParams],
  );

  const topicTab = useMemo((): TopicBucketTab => {
    if (topicResolution.kind === 'tab') return topicResolution.tab;
    return 'All';
  }, [topicResolution]);

  const topicSlug = useMemo(
    () => topicSlugFromBucketTab(topicTab),
    [topicTab],
  );

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
