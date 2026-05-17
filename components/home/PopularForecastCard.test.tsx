import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import type { Prediction } from "@/types/prediction";
import { PopularForecastCard } from "./PopularForecastCard";

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

function prediction(overrides: Partial<Prediction> = {}): Prediction {
  return {
    id: "p-1",
    source: "Jane Analyst",
    sourceSlug: "jane",
    text: "Will rates fall this year?",
    category: "Finance",
    created_at: "2024-06-01T00:00:00.000Z",
    resolved_at: null,
    target_date: null,
    outcome: "pending",
    ...overrides,
  };
}

describe("PopularForecastCard", () => {
  test("given a forecast, should label metrics as source track record not market odds", () => {
    const statsContext = [
      prediction({
        id: "p-1",
        outcome: "correct",
        resolved_at: "2024-07-01T00:00:00.000Z",
      }),
      prediction({
        id: "p-2",
        outcome: "incorrect",
        resolved_at: "2024-07-02T00:00:00.000Z",
      }),
    ];

    render(
      <PopularForecastCard
        prediction={prediction()}
        statsContext={statsContext}
      />,
    );

    expect(screen.getByText("Track record")).toBeInTheDocument();
    expect(
      screen.getByText(/not live market odds/i),
    ).toBeInTheDocument();
    expect(screen.queryByText("Consensus source")).not.toBeInTheDocument();
  });
});
