import type { PredictionFilters } from '@/types/prediction';

/** Omit default `newest` sort so list requests use server default ordering. */
export function toListRequestFilters<T extends Pick<PredictionFilters, 'sort'>>(
  filters: T,
): Omit<T, 'sort'> & Partial<Pick<PredictionFilters, 'sort'>> {
  const { sort, ...rest } = filters;
  if (sort === undefined || sort === 'newest') return rest;
  return { ...rest, sort };
}
