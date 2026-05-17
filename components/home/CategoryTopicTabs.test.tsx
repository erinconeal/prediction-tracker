import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { CategoryTopicTabs } from "./CategoryTopicTabs";

describe("CategoryTopicTabs", () => {
  test("uses fieldset with Topics legend and radio inputs", () => {
    const onChange = vi.fn();
    render(<CategoryTopicTabs active="All" onChange={onChange} />);

    const fieldset = screen.getByRole("group", { name: "Topics" });
    expect(fieldset.tagName).toBe("FIELDSET");

    const radios = within(fieldset).getAllByRole("radio");
    expect(radios.length).toBeGreaterThanOrEqual(5);
    expect(
      within(fieldset).getByRole("radio", { name: "All", checked: true }),
    ).toBeInTheDocument();
    expect(
      within(fieldset).getByRole("radio", { name: "Finance", checked: false }),
    ).toBeInTheDocument();
  });

  test("selecting a topic invokes onChange with that value", () => {
    const onChange = vi.fn();
    render(<CategoryTopicTabs active="All" onChange={onChange} />);

    const fieldset = screen.getByRole("group", { name: "Topics" });
    fireEvent.click(
      within(fieldset).getByRole("radio", { name: "Tech", checked: false }),
    );

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("Tech");
  });
});
