import { describe, expect, test } from "vitest";
import { truncateWithEllipsis } from "./truncate-text";

describe("truncateWithEllipsis", () => {
  test("given short text, should return trimmed unchanged", () => {
    expect(truncateWithEllipsis("  hello  ", 10)).toBe("hello");
  });

  test("given long text, should truncate with ellipsis", () => {
    expect(truncateWithEllipsis("abcdefghij", 4)).toBe("abcd…");
  });
});
