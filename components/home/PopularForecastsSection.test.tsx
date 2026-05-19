import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import type { Prediction } from "@/types/prediction";
import { PopularForecastsSection } from "./PopularForecastsSection";

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

function prediction(id: string): Prediction {
  return {
    id,
    source: "Source",
    sourceSlug: "source",
    text: `Prediction ${id}`,
    category: "Tech",
    topicIds: [],
    created_at: "2024-06-01T00:00:00.000Z",
    resolved_at: null,
    target_date: null,
    outcome: "pending",
  };
}

describe("PopularForecastsSection", () => {
  test("given loaded forecasts, should use Featured forecasts as section title", () => {
    render(
      <PopularForecastsSection
        predictions={[prediction("a")]}
        statsContext={[prediction("a")]}
        slotCount={4}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 2, name: "Featured forecasts" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Popular forecasts" }),
    ).not.toBeInTheDocument();
  });

  test("given more predictions than slots, should render only one row", () => {
    render(
      <PopularForecastsSection
        predictions={[
          prediction("a"),
          prediction("b"),
          prediction("c"),
          prediction("d"),
        ]}
        statsContext={[prediction("a")]}
        slotCount={2}
      />,
    );

    expect(screen.getAllByRole("article")).toHaveLength(2);
  });

  test("given loading, should expose busy state for featured forecasts", () => {
    render(
      <PopularForecastsSection
        predictions={[]}
        statsContext={[]}
        slotCount={3}
        loading
      />,
    );

    expect(screen.getByLabelText("Loading featured forecasts")).toHaveAttribute(
      "aria-busy",
      "true",
    );
  });
});
