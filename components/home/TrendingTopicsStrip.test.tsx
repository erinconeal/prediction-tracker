import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import type { Topic } from "@/types/topic";
import { TrendingTopicsStrip } from "./TrendingTopicsStrip";

const topic = (slug: string, name: string): Topic => ({
  id: `id-${slug}`,
  slug,
  name,
  categories: ["Tech"],
});

describe("TrendingTopicsStrip", () => {
  test("renders topic links", () => {
    render(
      <TrendingTopicsStrip
        topics={[
          { topic: topic("ai-regulation-2026", "AI regulation 2026"), count: 5, recentCount: 2 },
          { topic: topic("sp-hits-8000", "S&P hits 8000"), count: 3, recentCount: 1 },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { name: /trending topics/i })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /ai regulation 2026/i }),
    ).toHaveAttribute("href", "/topics/ai-regulation-2026");
  });

  test("hides when empty and not loading", () => {
    const { container } = render(<TrendingTopicsStrip topics={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});
