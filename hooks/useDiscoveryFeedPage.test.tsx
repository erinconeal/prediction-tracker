import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { usePredictionFeed } from "@/hooks/usePredictionFeed";
import { useDiscoveryFeedPage } from "./useDiscoveryFeedPage";

vi.mock("@/hooks/usePredictionFeed", () => ({
  usePredictionFeed: vi.fn(),
}));

const mockUsePredictionFeed = vi.mocked(usePredictionFeed);

describe("useDiscoveryFeedPage", () => {
  beforeEach(() => {
    mockUsePredictionFeed.mockReset();
  });

  test("given a category scope, should use one scoped prediction feed request", () => {
    mockUsePredictionFeed.mockReturnValue({
      data: [],
      loading: false,
      loadingMore: false,
      error: null,
      hasMore: false,
      refetch: vi.fn(),
      loadMore: vi.fn(),
    });

    renderHook(() =>
      useDiscoveryFeedPage({ kind: "category", category: "Finance" }),
    );

    expect(mockUsePredictionFeed).toHaveBeenCalledTimes(1);
    expect(mockUsePredictionFeed).toHaveBeenCalledWith(
      { category: "Finance", status: "all" },
      { pageSize: 80 },
    );
  });

  test("given outcome filter, should filter list client-side without a second fetch", async () => {
    mockUsePredictionFeed.mockReturnValue({
      data: [
        {
          id: "1",
          source: "S",
          sourceSlug: "s",
          text: "pending one",
          category: "Finance",
          topicIds: [],
          created_at: "2024-01-01T00:00:00.000Z",
          resolved_at: null,
          target_date: null,
          outcome: "pending",
        },
        {
          id: "2",
          source: "S",
          sourceSlug: "s",
          text: "correct one",
          category: "Finance",
          topicIds: [],
          created_at: "2024-01-02T00:00:00.000Z",
          resolved_at: "2024-01-03T00:00:00.000Z",
          target_date: null,
          outcome: "correct",
        },
      ],
      loading: false,
      loadingMore: false,
      error: null,
      hasMore: false,
      refetch: vi.fn(),
      loadMore: vi.fn(),
    });

    const { result } = renderHook(() =>
      useDiscoveryFeedPage({ kind: "category", category: "Finance" }),
    );

    act(() => {
      result.current.handleOutcomeFilter("correct");
    });

    await waitFor(() => {
      expect(result.current.listData).toHaveLength(1);
      expect(result.current.listData[0]!.outcome).toBe("correct");
    });

    expect(
      mockUsePredictionFeed.mock.calls.every(
        ([filters]) => filters.status === "all",
      ),
    ).toBe(true);
    expect(result.current.scopeData).toHaveLength(2);
  });
});
