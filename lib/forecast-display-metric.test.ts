import { describe, expect, test } from "vitest";
import { forecastDisplayMetricFromStats } from "./forecast-display-metric";
import type { SourceAccuracyStats } from "./source-stats";

function stats(accuracy: number | null): SourceAccuracyStats {
  return {
    name: "Test",
    total: 10,
    pending: 0,
    scored: accuracy === null ? 0 : 8,
    correct: accuracy === null ? 0 : 6,
    outcomeUnresolved: 0,
    invalid: 0,
    resolved: 10,
    accuracy,
  };
}

describe("forecastDisplayMetricFromStats", () => {
  test("maps high accuracy to up trend", () => {
    expect(forecastDisplayMetricFromStats(stats(82))).toEqual({
      percent: 82,
      trend: "up",
    });
  });

  test("maps low accuracy to down trend", () => {
    expect(forecastDisplayMetricFromStats(stats(14))).toEqual({
      percent: 14,
      trend: "down",
    });
  });

  test("maps mid accuracy to flat trend", () => {
    expect(forecastDisplayMetricFromStats(stats(49))).toEqual({
      percent: 49,
      trend: "flat",
    });
  });

  test("given no scored accuracy, should use flat trend without percent", () => {
    expect(forecastDisplayMetricFromStats(stats(null))).toEqual({
      percent: null,
      trend: "flat",
    });
  });
});
