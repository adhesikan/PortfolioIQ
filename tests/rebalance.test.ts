import { describe, expect, it } from "vitest";
import { generateRebalancePlan } from "@/lib/rebalance";
import { Holding } from "@/lib/types";

const holdings: Holding[] = [
  { ticker: "AAA", quantity: 10, avgCost: 100, assetClass: "equity", source: "manual" },
  { ticker: "BBB", quantity: 10, avgCost: 100, assetClass: "fixed-income", source: "manual" }
];

describe("generateRebalancePlan", () => {
  it("returns recommendations", () => {
    const plan = generateRebalancePlan(holdings, "Balanced Growth");
    expect(plan.length).toBeGreaterThan(0);
  });
});
