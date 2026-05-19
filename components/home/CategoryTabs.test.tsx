import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { CategoryTabs } from "./CategoryTabs";

describe("CategoryTabs", () => {
  test("renders category options including Weather", () => {
    render(<CategoryTabs active="All" onChange={vi.fn()} />);
    expect(screen.getByRole("radio", { name: "Weather" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Historical" })).toBeInTheDocument();
  });

  test("selecting a category invokes onChange with that value", () => {
    const onChange = vi.fn();
    render(<CategoryTabs active="All" onChange={onChange} />);
    fireEvent.click(screen.getByRole("radio", { name: "Finance" }));
    expect(onChange).toHaveBeenCalledWith("Finance");
  });
});
