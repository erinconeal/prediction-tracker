import { notFound } from "next/navigation";
import { CategoryFeedView } from "@/components/feed/CategoryFeedView";
import { categoryFromSlug } from "@/types/category";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const category = categoryFromSlug(slug);
  if (!category) {
    return { title: "Category not found" };
  }
  return {
    title: `${category} forecasts`,
    description: `Browse tracked predictions in ${category}.`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = categoryFromSlug(slug);
  if (!category) {
    notFound();
  }
  return <CategoryFeedView category={category} />;
}
