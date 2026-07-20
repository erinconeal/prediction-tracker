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
import { ApiError, getTopic } from '@/services/api';
import { isAbortError } from '@/utils/is-abort-error';

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
 * Missing topic (404) or OK response that failed client contract checks
 * (e.g. invalid kind on 200) — neither can resolve to a home tab/redirect.
 */
function isUnusableTopicError(error: unknown): error is ApiError {
  return error instanceof ApiError
    && (error.status === 404
      || (error.status >= 200 && error.status < 300));
}

async function lookupTopicBySlug(slug: string, signal?: AbortSignal) {
  try {
    const topic = await getTopic(slug, signal);
    return { slug: topic.slug, kind: topic.kind };
  }
  catch (error) {
    if (isUnusableTopicError(error)) {
      return null;
    }
    throw error;
  }
}

/**
 * Sync path for empty/`?topic=` bucket tabs (no network). Non-bucket slugs stay pending
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

    const controller = new AbortController();

    void (async () => {
      try {
        const resolution = await resolveHomeTopicQuery(
          rawTopic,
          lookupSlug => lookupTopicBySlug(lookupSlug, controller.signal),
        );
        if (!controller.signal.aborted) {
          setAsyncLookup({ slug, resolution });
        }
      }
      catch (error) {
        // Abort or transient API failure: leave pending.
        // Unusable topics (404 / bad contract) strip via lookup null.
        if (isAbortError(error) || controller.signal.aborted) return;
      }
    })();

    return () => {
      controller.abort();
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
