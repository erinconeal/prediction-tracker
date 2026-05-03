import { describe, expect, test } from "vitest";
import { getFilterKey } from "./filter-key";

describe("getFilterKey", () => {
  test("given empty filters, should return empty object key", () => {
    expect(getFilterKey({})).toBe("{}");
  });

  test("given source with extra whitespace, should trim source in key", () => {
    expect(getFilterKey({ source: "  Jane Analyst  " })).toBe(
      JSON.stringify({ source: "Jane Analyst" }),
    );
  });

  test("given status all, should omit status from key", () => {
    expect(getFilterKey({ status: "all" })).toBe("{}");
    expect(getFilterKey({ source: "Jane", status: "all" })).toBe(
      JSON.stringify({ source: "Jane" }),
    );
  });

  test("given concrete status, should include status in key", () => {
    expect(getFilterKey({ status: "correct" })).toBe(
      JSON.stringify({ status: "correct" }),
    );
  });

  test("given semantically equivalent filters, should return identical key", () => {
    const keyA = getFilterKey({ source: "Jane", status: "all" });
    const keyB = getFilterKey({ source: "  Jane  " });
    expect(keyA).toBe(keyB);
  });

  test("given sort newest or omitted, should omit sort from key", () => {
    expect(getFilterKey({ sort: "newest" })).toBe("{}");
    expect(getFilterKey({ status: "all", sort: "newest" })).toBe("{}");
  });

  test("given non-default sort, should include sort in key", () => {
    expect(getFilterKey({ sort: "recently_resolved" })).toBe(
      JSON.stringify({ sort: "recently_resolved" }),
    );
  });
});
