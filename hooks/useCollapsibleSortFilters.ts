'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';

export type UseCollapsibleSortFiltersResult = {
  sortFiltersOpen: boolean;
  toggleSortFilters: () => void;
  sortToggleRef: RefObject<HTMLButtonElement | null>;
  sortPanelRef: RefObject<HTMLDivElement | null>;
};

export function useCollapsibleSortFilters(): UseCollapsibleSortFiltersResult {
  const [sortFiltersOpen, setSortFiltersOpen] = useState(false);
  const sortToggleRef = useRef<HTMLButtonElement>(null);
  const sortPanelRef = useRef<HTMLDivElement>(null);
  const sortFiltersWasOpen = useRef(sortFiltersOpen);

  const toggleSortFilters = useCallback(() => {
    setSortFiltersOpen(open => !open);
  }, []);

  useEffect(() => {
    if (sortFiltersWasOpen.current === sortFiltersOpen) return;
    sortFiltersWasOpen.current = sortFiltersOpen;

    if (sortFiltersOpen) {
      const panel = sortPanelRef.current;
      const focusTarget
        = panel?.querySelector<HTMLInputElement>('input[type="radio"]:checked')
          ?? panel?.querySelector<HTMLInputElement>('input[type="radio"]');
      focusTarget?.focus();
      return;
    }

    sortToggleRef.current?.focus();
  }, [sortFiltersOpen]);

  return {
    sortFiltersOpen,
    toggleSortFilters,
    sortToggleRef,
    sortPanelRef,
  };
}
