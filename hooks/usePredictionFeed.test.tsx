import { act, renderHook, waitFor } from "@testing-library/react";
import { useMemo } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import type { Prediction, PredictionFilters } from "@/types/prediction";
import * as api from "@/services/api";
import {
  usePredictionFeed,
  type UsePredictionFeedResult,
} from "./usePredictionFeed";

vi.mock("@/services/api", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@/services/api")>();
  return {
    ...mod,
    listPredictions: vi.fn(),
  };
});

const listPredictions = vi.mocked(api.listPredictions);

function sample(overrides: Partial<Prediction> = {}): Prediction {
  return {
    id: "p-1",
    source: "Alice",
    sourceSlug: "alice",
    text: "It will rain",
    category: null,
    created_at: "2024-01-01T00:00:00.000Z",
    resolved_at: null,
    target_date: null,
    outcome: "pending",
    ...overrides,
  };
}

describe("usePredictionFeed", () => {
  beforeEach(() => {
    listPredictions.mockReset();
  });

  test("given first page resolves, should call list with limit offset zero and expose rows", async () => {
    const a = sample({ id: "a" });
    listPredictions.mockResolvedValue([a]);

    const { result } = renderHook(() =>
      usePredictionFeed({ status: "all" }, { pageSize: 20 }),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(listPredictions).toHaveBeenCalledWith(
      { status: "all", limit: 20, offset: 0 },
      expect.any(AbortSignal),
    );
    expect(result.current.data).toEqual([a]);
    expect(result.current.error).toBe(null);
    expect(result.current.hasMore).toBe(false);
  });

  test("given full first page, loadMore should request next offset and append", async () => {
    const page1 = [
      sample({ id: "0" }),
      sample({ id: "1" }),
    ];
    const page2 = [sample({ id: "2" })];
    listPredictions
      .mockResolvedValueOnce(page1)
      .mockResolvedValueOnce(page2);

    const { result } = renderHook(() =>
      usePredictionFeed({ status: "all" }, { pageSize: 2 }),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.hasMore).toBe(true);
    expect(result.current.data).toHaveLength(2);

    await act(async () => {
      await result.current.loadMore();
    });

    expect(listPredictions).toHaveBeenLastCalledWith(
      { status: "all", limit: 2, offset: 2 },
      expect.any(AbortSignal),
    );
    expect(result.current.data).toHaveLength(3);
    expect(result.current.hasMore).toBe(false);
  });

  test("given filter key change, should reset to new first page not append", async () => {
    listPredictions.mockImplementation(async (filters?: PredictionFilters) => {
      if (filters?.category === "Economics") {
        return [sample({ id: "econ", category: "Economics" })];
      }
      if (filters?.category === "Tech") {
        return [sample({ id: "tech", category: "Tech" })];
      }
      return [];
    });

    const { result, rerender } = renderHook(
      ({ category }: { category?: string }) => {
        const filters = useMemo(
          () => ({
            status: "all" as const,
            ...(category !== undefined ? { category } : {}),
          }),
          [category],
        );
        return usePredictionFeed(filters, { pageSize: 20 });
      },
      { initialProps: { category: "Economics" as string | undefined } },
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data[0]?.id).toBe("econ");

    rerender({ category: "Tech" });

    await waitFor(() => expect(result.current.data[0]?.id).toBe("tech"));

    expect(listPredictions).toHaveBeenLastCalledWith(
      { status: "all", category: "Tech", limit: 20, offset: 0 },
      expect.any(AbortSignal),
    );
  });

  test("given sort change, should reset to first page with new sort param", async () => {
    listPredictions.mockImplementation(async (filters?: PredictionFilters) => {
      if (filters?.sort === "source_accuracy") {
        return [sample({ id: "acc" })];
      }
      return [sample({ id: "default" })];
    });

    const { result, rerender } = renderHook<
      UsePredictionFeedResult,
      { sort?: PredictionFilters["sort"] }
    >(({ sort }) => {
      const filters = useMemo(
        () => ({
          status: "all" as const,
          ...(sort !== undefined && sort !== "newest" ? { sort } : {}),
        }),
        [sort],
      );
      return usePredictionFeed(filters, { pageSize: 20 });
    }, { initialProps: { sort: "newest" } });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data[0]?.id).toBe("default");

    rerender({ sort: "source_accuracy" });

    await waitFor(() => expect(result.current.data[0]?.id).toBe("acc"));

    expect(listPredictions).toHaveBeenLastCalledWith(
      { status: "all", sort: "source_accuracy", limit: 20, offset: 0 },
      expect.any(AbortSignal),
    );
  });

  test("given refetch, should pass AbortSignal to listPredictions", async () => {
    listPredictions.mockResolvedValue([sample()]);

    const { result } = renderHook(() =>
      usePredictionFeed({ status: "all" }, { pageSize: 20 }),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    listPredictions.mockClear();

    await act(async () => {
      listPredictions.mockResolvedValue([sample({ id: "refetched" })]);
      await result.current.refetch();
    });

    expect(listPredictions).toHaveBeenCalledWith(
      { status: "all", limit: 20, offset: 0 },
      expect.any(AbortSignal),
    );
    expect(result.current.data[0]?.id).toBe("refetched");
  });
});
