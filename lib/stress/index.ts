import { Holding, StressScenario } from "@/lib/types";

const bucketMap: Record<string, string[]> = {
  "US Growth": ["equity", "etf"],
  "EM": ["equity"],
  "Income": ["fixed-income"],
  "Crypto": ["crypto"],
  "Cash": ["cash"]
};

export const defaultScenarios: StressScenario[] = [
  {
    name: "2022 Rate Shock",
    description: "Rates up, growth down, crypto hit harder.",
    shocks: [
      { bucket: "US Growth", shockPct: -0.18, label: "US Growth -18%" },
      { bucket: "EM", shockPct: -0.12, label: "EM -12%" },
      { bucket: "Crypto", shockPct: -0.45, label: "Crypto -45%" }
    ]
  },
  {
    name: "Single Stock Shock",
    description: "Largest holding drops 40%.",
    shocks: [{ bucket: "Largest", shockPct: -0.4, label: "Largest holding -40%" }]
  },
  {
    name: "Global Recession",
    description: "Broad drawdown with defensives holding up.",
    shocks: [
      { bucket: "US Growth", shockPct: -0.22, label: "Broad -22%" },
      { bucket: "Income", shockPct: -0.08, label: "Income -8%" }
    ]
  }
];

export type StressResult = {
  scenario: string;
  impactPct: number;
  impactDollars: number;
  topContributors: { ticker: string; impact: number }[];
};

export const runStressTest = (
  holdings: Holding[],
  scenario: StressScenario
): StressResult => {
  const totalValue = holdings.reduce((sum, holding) => {
    const value = holding.value ?? holding.lastPrice ?? holding.avgCost ?? 0;
    return sum + value * holding.quantity;
  }, 0);

  const impacts = holdings.map((holding) => {
    const value = (holding.value ?? holding.lastPrice ?? holding.avgCost ?? 0) * holding.quantity;
    let shock = 0;

    if (scenario.name === "Single Stock Shock") {
      return { ticker: holding.ticker, impact: holding === holdings[0] ? value * -0.4 : 0 };
    }

    scenario.shocks.forEach((shockItem) => {
      const buckets = bucketMap[shockItem.bucket] ?? [];
      if (buckets.includes(holding.assetClass)) {
        shock += shockItem.shockPct;
      }
    });

    return { ticker: holding.ticker, impact: value * shock };
  });

  const impactDollars = impacts.reduce((sum, item) => sum + item.impact, 0);
  const impactPct = totalValue > 0 ? impactDollars / totalValue : 0;
  const topContributors = impacts
    .sort((a, b) => a.impact - b.impact)
    .slice(0, 3);

  return {
    scenario: scenario.name,
    impactPct,
    impactDollars,
    topContributors
  };
};
