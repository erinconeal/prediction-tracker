import { PredictionDetailView } from "@/components/predictions/PredictionDetailView";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function PredictionPage({ params }: PageProps) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  return <PredictionDetailView id={decoded} />;
}
