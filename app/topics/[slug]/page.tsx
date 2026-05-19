import { notFound } from "next/navigation";
import { TopicFeedView } from "@/components/feed/TopicFeedView";
import { getTopicBySlug } from "@/lib/topic-store";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) {
    return { title: "Topic not found" };
  }
  return {
    title: topic.name,
    description: `Forecasts about ${topic.name}.`,
  };
}

export default async function TopicPage({ params }: PageProps) {
  const { slug } = await params;
  const topic = getTopicBySlug(slug);
  if (!topic) {
    notFound();
  }
  return <TopicFeedView topic={topic} />;
}
