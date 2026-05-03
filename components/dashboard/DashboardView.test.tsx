import type { ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import type { Prediction } from "@/types/prediction";
import * as api from "@/services/api";
import type { PredictionFilters } from "@/types/prediction";
import { DashboardView } from "./DashboardView";

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...rest
  }: {
    children: ReactNode;
    href: string;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("@/services/api", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@/services/api")>();
  return {
    ...mod,
    listPredictions: vi.fn(),
    listLeaderboard: vi.fn(),
  };
});

const listPredictions = vi.mocked(api.listPredictions);
const listLeaderboard = vi.mocked(api.listLeaderboard);

function row(i: number): Prediction {
  return {
    id: `id-${i}`,
    source: "Source",
    sourceSlug: "source",
    text: `Prediction ${i}`,
    category: null,
    created_at: "2024-01-01T00:00:00.000Z",
    resolved_at: null,
    target_date: null,
    outcome: "pending",
  };
}

const leaderboardRow = {
  rank: 1,
  source: "Source",
  total: 1,
  resolved: 0,
  correct: 0,
  accuracyPercent: null as number | null,
  streakKind: null as "correct" | "incorrect" | null,
  streakLength: 0,
};

describe("DashboardView", () => {
  beforeEach(() => {
    listPredictions.mockReset();
    listLeaderboard.mockReset();
    listLeaderboard.mockResolvedValue([leaderboardRow]);
  });

  test("given list error then retry succeeds, should show error then recover", async () => {
    let allowSuccess = false;
    listPredictions.mockImplementation(async () => {
      if (!allowSuccess) {
        throw new api.ApiError("offline", 503);
      }
      return [row(0)];
    });

    render(<DashboardView />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
    expect(screen.getByText("offline")).toBeInTheDocument();

    allowSuccess = true;
    fireEvent.click(screen.getByRole("button", { name: /retry/i }));

    await waitFor(() => {
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
    await waitFor(() => {
      const toDetail = screen.getAllByRole("link").filter(
        (el) => el.getAttribute("href") === "/predictions/id-0",
      );
      expect(toDetail.length).toBeGreaterThan(0);
    });
  });

  test("given full first page, load more should request next offset", async () => {
    const page1 = Array.from({ length: 20 }, (_, i) => row(i));
    listPredictions.mockImplementation(async (filters?: PredictionFilters) => {
      if ((filters?.offset ?? 0) === 0) return page1;
      return [row(99)];
    });

    render(<DashboardView />);

    await waitFor(() => {
      expect(screen.getAllByText("Prediction 0").length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getByRole("button", { name: /^load more$/i }));

    await waitFor(() => {
      const gridCard = document.querySelector(
        'ul a[href="/predictions/id-99"]',
      );
      expect(gridCard).toBeTruthy();
    });

    expect(listPredictions).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 20, offset: 20 }),
      expect.any(AbortSignal),
    );
  });
});
