'use client';

import { useSyncExternalStore } from 'react';
import { featuredForecastSlotCount } from '@/lib/featured-forecast-columns';

function subscribe(onStoreChange: () => void) {
  const cleanups: (() => void)[] = [];

  if (typeof window.matchMedia === 'function') {
    for (const query of ['(min-width: 1024px)', '(min-width: 1280px)']) {
      const mq = window.matchMedia(query);
      mq.addEventListener('change', onStoreChange);
      cleanups.push(() => mq.removeEventListener('change', onStoreChange));
    }
  }

  window.addEventListener('resize', onStoreChange);
  cleanups.push(() => window.removeEventListener('resize', onStoreChange));

  return () => {
    for (const cleanup of cleanups) cleanup();
  };
}

function getSnapshot() {
  return featuredForecastSlotCount(window.innerWidth);
}

function getServerSnapshot() {
  return 1;
}

export function useFeaturedForecastSlotCount(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
