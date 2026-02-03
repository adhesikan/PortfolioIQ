import { Holding } from "@/lib/types";
import { computeHoldingMetrics } from "@/lib/analytics";

export type ScoreBreakdown = {
  diversification: number;
  concentration: number;
  resilience: number;
  fit: number;
  hygiene: number;
  total: number;
  notes: string[];
  improvements: string[];
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const scorePortfolio = (holdings: Holding[], rubric: "strict" | "lenient" = "strict"): ScoreBreakdown => {
  const metrics = computeHoldingMetrics(holdings);
  const concentrationPenalty = metrics.topWeights.top1 * 100;
  const diversification = clamp(25 - metrics.hhi * 100 * (rubric === "strict" ? 1.2 : 0.9), 0, 25);
  const concentration = clamp(25 - concentrationPenalty * (rubric === "strict" ? 0.5 : 0.35), 0, 25);
  const resilience = clamp(15 + metrics.effectiveHoldings * 1.5, 0, 25);
  const fit = clamp(10 + metrics.topWeights.top5 * 25, 0, 15);
  const hygienePenalty = metrics.tinyPositions * 0.75;
  const hygiene = clamp(10 - hygienePenalty, 0, 10);

  const total = clamp(diversification + concentration + resilience + fit + hygiene, 0, 100);

  const notes = [
    `HHI concentration: ${(metrics.hhi * 100).toFixed(1)}%`,
    `Top holding weight: ${(metrics.topWeights.top1 * 100).toFixed(1)}%`,
    `Effective holdings: ${metrics.effectiveHoldings.toFixed(1)}`
  ];

  const improvements = [
    metrics.topWeights.top1 > 0.15
      ? "Consider reducing the largest holding to improve concentration risk."
      : "Largest holding is within a diversified range.",
    metrics.tinyPositions > 3
      ? "Consider consolidating tiny positions to reduce fragmentation."
      : "Position sizing looks consistent."
  ];

  return {
    diversification,
    concentration,
    resilience,
    fit,
    hygiene,
    total,
    notes,
    improvements
  };
};
