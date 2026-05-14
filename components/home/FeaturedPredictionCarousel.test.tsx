import type { ReactNode } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import type { Prediction } from "@/types/prediction";
import { FeaturedPredictionCarousel } from "./FeaturedPredictionCarousel";

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
    source: "Source A",
    sourceSlug: "source-a",
    text: "First prediction text",
    category: "Tech",
    created_at: "2024-01-01T00:00:00.000Z",
    resolved_at: null,
    target_date: null,
    outcome: "pending",
    ...overrides,
  };
}

describe("FeaturedPredictionCarousel", () => {
  test("slide indicators use group semantics, not tablist", () => {
    const slides = [
      prediction({ id: "a", text: "Alpha" }),
      prediction({ id: "b", text: "Beta", sourceSlug: "b" }),
    ];
    render(
      <FeaturedPredictionCarousel
        predictions={slides}
        spotlightTitle="This week"
      />,
    );

    expect(
      screen.getByRole("group", { name: "Slide indicators" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    expect(screen.queryByRole("tab")).not.toBeInTheDocument();
  });

  test("first slide indicator has aria-current; live region is status", () => {
    const slides = [
      prediction({ id: "a" }),
      prediction({ id: "b", sourceSlug: "b", text: "Second" }),
    ];
    const { container } = render(
      <FeaturedPredictionCarousel
        predictions={slides}
        spotlightTitle="Highlights"
      />,
    );

    const group = screen.getByRole("group", { name: "Slide indicators" });
    const dots = within(group).getAllByRole("button");
    expect(dots).toHaveLength(2);
    expect(dots[0]).toHaveAttribute("aria-current", "true");
    expect(dots[1]).not.toHaveAttribute("aria-current");

    const live = container.querySelector('[id$="-live"]');
    expect(live).toBeTruthy();
    expect(live).toHaveAttribute("role", "status");
    expect(live).toHaveAttribute("aria-live", "polite");
  });

  test("activating second indicator updates aria-current", () => {
    const slides = [
      prediction({ id: "a", text: "First headline" }),
      prediction({
        id: "b",
        text: "Second headline",
        sourceSlug: "other",
        source: "Other",
      }),
    ];
    render(
      <FeaturedPredictionCarousel
        predictions={slides}
        spotlightTitle="Spotlight"
      />,
    );

    const group = screen.getByRole("group", { name: "Slide indicators" });
    const dots = within(group).getAllByRole("button");
    fireEvent.click(dots[1]);

    expect(dots[0]).not.toHaveAttribute("aria-current");
    expect(dots[1]).toHaveAttribute("aria-current", "true");
    expect(
      screen.getByRole("link", { name: "Second headline" }),
    ).toBeInTheDocument();
  });
});
