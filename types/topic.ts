import type { Category } from '@/types/category';

export type Topic = {
  id: string;
  slug: string;
  name: string;
  categories: Category[];
};
