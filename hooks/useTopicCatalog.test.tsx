import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import * as api from "@/services/api";
import {
  resetTopicCatalogCacheForTests,
  useTopicCatalog,
} from "./useTopicCatalog";

vi.mock("@/services/api", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@/services/api")>();
  return {
    ...mod,
    listTopics: vi.fn(),
  };
});

const listTopics = vi.mocked(api.listTopics);

describe("useTopicCatalog", () => {
  beforeEach(() => {
    listTopics.mockReset();
    resetTopicCatalogCacheForTests();
  });

  test("given topic ids, should resolve topics from the API catalog", async () => {
    listTopics.mockResolvedValue([
      {
        id: "topic-ai",
        slug: "ai-regulation-2026",
        name: "AI regulation 2026",
        categories: ["Tech"],
      },
    ]);

    const { result } = renderHook(() => useTopicCatalog());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(
      result.current.getTopicsByIds(["topic-ai"]).map((t) => t.slug),
    ).toEqual(["ai-regulation-2026"]);
  });
});
