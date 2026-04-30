import { describe, expect, test } from "vitest";
import { isAbortError } from "./is-abort-error";

describe("isAbortError", () => {
  test("given DOMException AbortError, should return true", () => {
    expect(
      isAbortError(new DOMException("aborted", "AbortError")),
    ).toBe(true);
  });

  test("given Error AbortError, should return true", () => {
    const e = new Error("aborted");
    e.name = "AbortError";
    expect(isAbortError(e)).toBe(true);
  });

  test("given other error, should return false", () => {
    expect(isAbortError(new Error("fail"))).toBe(false);
  });
});
