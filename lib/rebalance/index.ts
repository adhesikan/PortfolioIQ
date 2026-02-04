import { Holding, RebalancePreset, Recommendation } from "@/lib/types";
import { computeHoldingMetrics } from "@/lib/analytics";

export type { RebalancePreset } from "@/lib/types";

const presetBands: Record<RebalancePreset, Record<string, { min: number; max: number }>> = {
  "Balanced Growth": {
    equity: { min: 0.45, max: 0.65 },
    etf: { min: 0.2, max: 0.4 },
    crypto: { min: 0.0, max: 0.05 },
    "fixed-income": { min: 0.05, max: 0.2 },
    cash: { min: 0.02, max: 0.08 }
  },
  "Growth + Income": {
    equity: { min: 0.4, max: 0.6 },
    etf: { min: 0.15, max: 0.35 },
    crypto: { min: 0.0, max: 0.04 },
    "fixed-income": { min: 0.1, max: 0.25 },
    cash: { min: 0.03, max: 0.1 }
  },
  "Conservative Income": {
    equity: { min: 0.2, max: 0.4 },
    etf: { min: 0.2, max: 0.3 },
    crypto: { min: 0.0, max: 0.02 },
    "fixed-income": { min: 0.25, max: 0.45 },
    cash: { min: 0.05, max: 0.15 }
  },
  "Aggressive Growth": {
    equity: { min: 0.55, max: 0.75 },
    etf: { min: 0.15, max: 0.3 },
    crypto: { min: 0.0, max: 0.08 },
    "fixed-income": { min: 0.0, max: 0.1 },
    cash: { min: 0.02, max: 0.06 }
  }
};

export const generateRebalancePlan = (
  holdings: Holding[],
  preset: RebalancePreset,
  preferAdds = true
): Recommendation[] => {
  const metrics = computeHoldingMetrics(holdings);
  const totalValue = metrics.totalValue || 1;
  const bands = presetBands[preset];

  const bucketWeights = holdings.reduce<Record<string, number>>((acc, holding) => {
    const value = (holding.value ?? holding.lastPrice ?? holding.avgCost ?? 0) * holding.quantity;
    acc[holding.assetClass] = (acc[holding.assetClass] ?? 0) + value / totalValue;
    return acc;
  }, {});

  const recommendations: Recommendation[] = [];

  Object.entries(bands).forEach(([bucket, band]) => {
    const weight = bucketWeights[bucket] ?? 0;
    if (weight > band.max) {
      recommendations.push({
        ticker: bucket.toUpperCase(),
        action: "consider_trim",
        dollars: totalValue * (weight - band.max),
        rationale: `${bucket} weight above target band.`,
        confidence: 0.6
      });
    } else if (weight < band.min) {
      recommendations.push({
        ticker: bucket.toUpperCase(),
        action: "consider_buy",
        dollars: totalValue * (band.min - weight),
        rationale: `${bucket} weight below target band.`,
        confidence: 0.65
      });
    }
  });

  if (preferAdds) {
    return recommendations.sort((a, b) => (a.action === "consider_buy" ? -1 : 1));
  }

  return recommendations;
};
