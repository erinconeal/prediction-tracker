import { describe, expect, test } from "vitest";
import { formatMonthYear } from "./format-date";

describe("formatMonthYear", () => {
  test("given ISO instant, should include calendar year", () => {
    const s = formatMonthYear("2026-12-31T00:00:00.000Z");
    expect(s).toContain("2026");
    expect(s.length).toBeGreaterThan(3);
  });

  test("given invalid string, should echo input", () => {
    expect(formatMonthYear("not-a-date")).toBe("not-a-date");
  });
});
