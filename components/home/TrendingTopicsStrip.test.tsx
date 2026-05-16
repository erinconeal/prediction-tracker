import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { TrendingTopicsStrip } from "./TrendingTopicsStrip";

describe("TrendingTopicsStrip", () => {
  test("renders topic buttons and calls onSelect", () => {
    const onSelect = vi.fn();
    render(
      <TrendingTopicsStrip
        topics={[
          { topic: "Tech", count: 5, recentCount: 2 },
          { topic: "Economics", count: 3, recentCount: 1 },
        ]}
        active="All"
        onSelect={onSelect}
      />,
    );

    expect(screen.getByRole("heading", { name: /trending topics/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /tech/i }));
    expect(onSelect).toHaveBeenCalledWith("Tech");
  });

  test("hides when empty and not loading", () => {
    const { container } = render(
      <TrendingTopicsStrip topics={[]} active="All" onSelect={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  test("embedded showAllTopic renders All control", () => {
    const onSelect = vi.fn();
    render(
      <TrendingTopicsStrip
        topics={[{ topic: "Tech", count: 1, recentCount: 1 }]}
        active="All"
        onSelect={onSelect}
        embedded
        showAllTopic
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /^all$/i }));
    expect(onSelect).toHaveBeenCalledWith("All");
  });
});
