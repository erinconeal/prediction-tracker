'use client';

import { useSyncExternalStore } from 'react';
import { popularForecastSlotCount } from '@/lib/popular-forecast-columns';

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
  return popularForecastSlotCount(window.innerWidth);
}

function getServerSnapshot() {
  return 1;
}

/**
 * @returns The number of popular forecast slots to display based on the viewport width (1, 3, or 4)
 */
export function usePopularForecastSlotCount(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
