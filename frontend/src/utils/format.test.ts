import { describe, expect, it } from "vitest";
import { formatMoney, formatPercent } from "./format";

describe("formatMoney", () => {
  it("formats cents as whole-euro currency", () => {
    expect(formatMoney(5_800_000)).toBe("€58,000");
  });

  it("rounds to the nearest euro", () => {
    expect(formatMoney(12_450)).toBe("€125");
  });

  it("handles zero", () => {
    expect(formatMoney(0)).toBe("€0");
  });
});

describe("formatPercent", () => {
  it("formats a fraction as a rounded percent", () => {
    expect(formatPercent(0.375)).toBe("38%");
  });

  it("handles zero", () => {
    expect(formatPercent(0)).toBe("0%");
  });
});
