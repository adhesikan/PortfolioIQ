import { describe, expect, it } from "vitest";
import { validateExtraction } from "@/lib/importers/imageImport";

const sample = {
  holdings: [
    {
      ticker: "AAPL",
      quantity: 10,
      avgCost: 120,
      lastPrice: 190,
      value: 1900,
      currency: "USD",
      confidence: 0.9
    }
  ],
  warnings: [],
  overallConfidence: 0.9
};

describe("validateExtraction", () => {
  it("sanitizes holdings", () => {
    const result = validateExtraction(sample);
    expect(result.holdings[0].ticker).toBe("AAPL");
  });
});
