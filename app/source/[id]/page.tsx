import { SourceDetailView } from "@/components/source/SourceDetailView";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function SourcePage({ params }: PageProps) {
  const { id } = await params;
  const sourceSlug = decodeURIComponent(id);
  return <SourceDetailView sourceSlug={sourceSlug} />;
}
