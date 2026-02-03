import { describe, expect, it } from "vitest";
import { defaultScenarios, runStressTest } from "@/lib/stress";
import { Holding } from "@/lib/types";

const holdings: Holding[] = [
  { ticker: "AAA", quantity: 10, avgCost: 100, assetClass: "equity", source: "manual" },
  { ticker: "BTC", quantity: 1, avgCost: 20000, assetClass: "crypto", source: "manual" }
];

describe("runStressTest", () => {
  it("computes a stress impact", () => {
    const result = runStressTest(holdings, defaultScenarios[0]);
    expect(result.impactDollars).toBeTypeOf("number");
  });
});
