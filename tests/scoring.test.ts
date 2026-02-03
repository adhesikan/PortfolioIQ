import { describe, expect, it } from "vitest";
import { scorePortfolio } from "@/lib/scoring";
import { Holding } from "@/lib/types";

const holdings: Holding[] = [
  { ticker: "AAA", quantity: 10, avgCost: 100, assetClass: "equity", source: "manual" },
  { ticker: "BBB", quantity: 10, avgCost: 100, assetClass: "equity", source: "manual" },
  { ticker: "CCC", quantity: 10, avgCost: 100, assetClass: "etf", source: "manual" }
];

describe("scorePortfolio", () => {
  it("returns a score within bounds", () => {
    const score = scorePortfolio(holdings);
    expect(score.total).toBeGreaterThanOrEqual(0);
    expect(score.total).toBeLessThanOrEqual(100);
  });
});
