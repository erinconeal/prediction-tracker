import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import type { Prediction } from "@/types/prediction";
import { BrowseForecastCard } from "./BrowseForecastCard";

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
    outcome: "incorrect",
    ...overrides,
  };
}

describe("BrowseForecastCard", () => {
  test("exposes separate links for category, title, and source without a wrapping card link", () => {
    const onCategorySelect = vi.fn();
    const { container } = render(
      <BrowseForecastCard
        prediction={prediction()}
        outcomeFilter="all"
        onOutcomeFilter={vi.fn()}
        onCategorySelect={onCategorySelect}
      />,
    );

    expect(
      screen.getByRole("link", { name: /will rates fall/i }),
    ).toHaveAttribute("href", "/predictions/p-1");
    expect(screen.getByRole("link", { name: /jane analyst/i })).toHaveAttribute(
      "href",
      "/source/jane",
    );
    expect(
      screen.getByRole("button", { name: /browse finance forecasts/i }),
    ).toBeInTheDocument();
    expect(container.querySelector("article > a")).toBeNull();
  });

  test("outcome badge filters browse feed when clicked", () => {
    const onOutcomeFilter = vi.fn();
    render(
      <BrowseForecastCard
        prediction={prediction()}
        outcomeFilter="all"
        onOutcomeFilter={onOutcomeFilter}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /filter browse forecasts by incorrect/i,
      }),
    );

    expect(onOutcomeFilter).toHaveBeenCalledWith("incorrect");
  });

  test("track record corner is not used", () => {
    render(
      <BrowseForecastCard
        prediction={prediction()}
        outcomeFilter="all"
        onOutcomeFilter={vi.fn()}
      />,
    );

    expect(screen.queryByText("Track record")).not.toBeInTheDocument();
  });
});
