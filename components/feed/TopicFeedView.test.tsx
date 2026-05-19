import { render } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import type { Topic } from "@/types/topic";
import { TopicFeedView } from "./TopicFeedView";
import { useDiscoveryFeedPage } from "@/hooks/useDiscoveryFeedPage";

vi.mock("@/hooks/useDiscoveryFeedPage", () => ({
  useDiscoveryFeedPage: vi.fn(),
}));

vi.mock("@/hooks/useTrendingTopics", () => ({
  useTrendingTopics: () => ({ data: [], loading: false, error: null }),
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

const mockUseDiscoveryFeedPage = vi.mocked(useDiscoveryFeedPage);

const topic: Topic = {
  id: "topic-ai",
  slug: "ai-regulation-2026",
  name: "AI regulation 2026",
  categories: ["Tech", "Politics"],
};

function idleFeed() {
  return {
    listSort: "newest" as const,
    setListSort: vi.fn(),
    outcomeFilter: "all" as const,
    setOutcomeFilter: vi.fn(),
    handleOutcomeFilter: vi.fn(),
    clearOutcomeFilter: vi.fn(),
    listData: [],
    scopeData: [],
    loading: false,
    loadingMore: false,
    error: null,
    hasMore: false,
    refetch: vi.fn(),
    loadMore: vi.fn(),
    recentResolutions: [],
    platformStats: { trackedCount: 0, averageAccuracyPercent: null },
  };
}

describe("TopicFeedView", () => {
  beforeEach(() => {
    mockUseDiscoveryFeedPage.mockReset();
    mockUseDiscoveryFeedPage.mockReturnValue(idleFeed());
  });

  test("given a topic, should load feed via discovery scope hook", () => {
    render(<TopicFeedView topic={topic} />);

    expect(mockUseDiscoveryFeedPage).toHaveBeenCalledWith({
      kind: "topic",
      topicSlug: "ai-regulation-2026",
    });
  });
});
