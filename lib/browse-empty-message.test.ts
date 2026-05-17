import { describe, expect, test } from "vitest";
import { browseEmptyMessage } from "./browse-empty-message";

describe("browseEmptyMessage", () => {
  test("given topic and outcome filters, should mention both", () => {
    expect(browseEmptyMessage("Tech", "incorrect")).toBe(
      "No incorrect forecasts in “Tech” yet.",
    );
  });

  test("given outcome filter only, should mention outcome", () => {
    expect(browseEmptyMessage("All", "incorrect")).toBe(
      "No incorrect forecasts in this view yet.",
    );
  });

  test("given topic filter only, should mention topic", () => {
    expect(browseEmptyMessage("Finance", "all")).toBe(
      "No predictions in “Finance” yet.",
    );
  });
});
