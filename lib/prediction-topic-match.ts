import type { Category } from '@/types/category';
import { categoryFromSlug, isCategory } from '@/types/category';
import type { Prediction } from '@/types/prediction';
import { getTopicBySlug, getTopicsByIds } from '@/lib/topic-store';

export function predictionMatchesTopicSlug(
  p: Prediction,
  topicSlug: string,
): boolean {
  const topic = getTopicBySlug(topicSlug);
  if (!topic) return false;
  return p.topicIds.includes(topic.id);
}

export function predictionMatchesCategory(
  p: Prediction,
  categoryFilter: string,
): boolean {
  const c = categoryFilter.trim().toLowerCase();
  if (!c) return true;

  if (p.category !== null && p.category.toLowerCase() === c) {
    return true;
  }

  const linked = getTopicsByIds(p.topicIds);
  return linked.some(t =>
    t.categories.some(cat => cat.toLowerCase() === c),
  );
}

export function predictionMatchesCategoryEnum(
  p: Prediction,
  category: Category,
): boolean {
  return predictionMatchesCategory(p, category);
}

export function normalizeCategoryFilter(
  value: string | undefined,
): Category | undefined {
  if (!value?.trim()) return undefined;
  const fromSlug = categoryFromSlug(value);
  if (fromSlug) return fromSlug;
  if (isCategory(value.trim())) return value.trim() as Category;
  return undefined;
}
