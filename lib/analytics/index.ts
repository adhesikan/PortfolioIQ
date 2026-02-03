import { Holding } from "@/lib/types";

export type HoldingMetrics = {
  totalValue: number;
  weights: Record<string, number>;
  topWeights: {
    top1: number;
    top5: number;
    top10: number;
  };
  hhi: number;
  effectiveHoldings: number;
  tinyPositions: number;
};

const safeNumber = (value: number | null | undefined) => (Number.isFinite(value) ? value : 0);

export const computeHoldingMetrics = (holdings: Holding[]): HoldingMetrics => {
  const values = holdings.map((holding) => {
    if (holding.value && holding.value > 0) return holding.value;
    if (holding.lastPrice && holding.quantity) return holding.lastPrice * holding.quantity;
    if (holding.avgCost && holding.quantity) return holding.avgCost * holding.quantity;
    return 0;
  });

  const totalValue = values.reduce((sum, value) => sum + value, 0);
  const weights: Record<string, number> = {};

  holdings.forEach((holding, index) => {
    const weight = totalValue > 0 ? values[index] / totalValue : 0;
    weights[holding.ticker] = weight;
  });

  const sortedWeights = Object.values(weights).sort((a, b) => b - a);
  const top1 = sortedWeights[0] ?? 0;
  const top5 = sortedWeights.slice(0, 5).reduce((sum, weight) => sum + weight, 0);
  const top10 = sortedWeights.slice(0, 10).reduce((sum, weight) => sum + weight, 0);

  const hhi = Object.values(weights).reduce((sum, weight) => sum + weight * weight, 0);
  const effectiveHoldings = hhi > 0 ? 1 / hhi : 0;

  const tinyPositions = Object.values(weights).filter((weight) => weight < 0.005).length;

  return {
    totalValue: safeNumber(totalValue),
    weights,
    topWeights: { top1, top5, top10 },
    hhi,
    effectiveHoldings,
    tinyPositions
  };
};
