import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { LeaderboardSection } from "./LeaderboardSection";
import * as useLeaderboardModule from "@/hooks/useLeaderboard";

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

vi.mock("@/hooks/useLeaderboard");

const useLeaderboard = vi.mocked(useLeaderboardModule.useLeaderboard);

const sampleRow = {
  rank: 1,
  source: "Jane Analyst",
  sourceSlug: "jane-analyst",
  total: 4,
  resolved: 3,
  scored: 3,
  correct: 3,
  accuracyPercent: 100,
  pending: 1,
  outcomeUnresolved: 0,
  invalid: 0,
  streakKind: "correct" as const,
  streakLength: 3,
};

describe("LeaderboardSection", () => {
  beforeEach(() => {
    useLeaderboard.mockReset();
  });

  test("renders featured leader with source slug link", async () => {
    useLeaderboard.mockReturnValue({
      rows: [sampleRow],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<LeaderboardSection limit={10} />);

    expect(
      screen.getByRole("heading", { name: /top predictors/i }),
    ).toBeInTheDocument();
    const profile = screen.getByRole("link", { name: "Jane Analyst" });
    expect(profile).toHaveAttribute("href", "/source/jane-analyst");
  });

  test("given error, retry calls refetch", async () => {
    const refetch = vi.fn().mockResolvedValue(undefined);
    useLeaderboard.mockReturnValue({
      rows: [],
      loading: false,
      error: "offline",
      refetch,
    });

    render(<LeaderboardSection />);

    fireEvent.click(screen.getByRole("button", { name: /retry/i }));
    expect(refetch).toHaveBeenCalled();
  });

  test("shows loading shell while fetching", () => {
    useLeaderboard.mockReturnValue({
      rows: [],
      loading: true,
      error: null,
      refetch: vi.fn(),
    });

    render(<LeaderboardSection />);

    expect(document.querySelector(".animate-pulse")).toBeTruthy();
  });
});
