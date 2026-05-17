import { describe, expect, test } from "vitest";
import { topicTabFromCategory } from "./topic-tabs";

describe("topicTabFromCategory", () => {
  test("maps known category labels to topic tabs", () => {
    expect(topicTabFromCategory("Tech")).toBe("Tech");
    expect(topicTabFromCategory("finance")).toBe("Finance");
  });

  test("returns undefined for unknown categories", () => {
    expect(topicTabFromCategory("Weather")).toBeUndefined();
    expect(topicTabFromCategory(null)).toBeUndefined();
  });
});
