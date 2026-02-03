import { computeHoldingMetrics } from "@/lib/analytics";
import { scorePortfolio } from "@/lib/scoring";
import { defaultScenarios, runStressTest } from "@/lib/stress";
import { generateRebalancePlan } from "@/lib/rebalance";
import { Holding } from "@/lib/types";

const demoHoldings: Holding[] = [
  {
    ticker: "AAPL",
    quantity: 40,
    avgCost: 140,
    lastPrice: 190,
    assetClass: "equity",
    source: "manual"
  },
  {
    ticker: "VTI",
    quantity: 25,
    avgCost: 200,
    lastPrice: 260,
    assetClass: "etf",
    source: "csv"
  },
  {
    ticker: "TLT",
    quantity: 15,
    avgCost: 100,
    lastPrice: 95,
    assetClass: "fixed-income",
    source: "csv"
  },
  {
    ticker: "BTC",
    quantity: 0.4,
    avgCost: 30000,
    lastPrice: 62000,
    assetClass: "crypto",
    source: "image"
  },
  {
    ticker: "CASH",
    quantity: 1,
    avgCost: 8000,
    lastPrice: 8000,
    assetClass: "cash",
    source: "manual"
  }
];

export default function DashboardPage() {
  const metrics = computeHoldingMetrics(demoHoldings);
  const score = scorePortfolio(demoHoldings);
  const stress = defaultScenarios.map((scenario) => runStressTest(demoHoldings, scenario));
  const recommendations = generateRebalancePlan(demoHoldings, "Balanced Growth");

  return (
    <div className="container-page space-y-8">
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="card space-y-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">Portfolio Score</p>
          <p className="text-4xl font-semibold text-brand-primary">{Math.round(score.total)}</p>
          <p className="text-sm text-slate-600">Why this score</p>
          <ul className="text-xs text-slate-500">
            {score.notes.map((note) => (
              <li key={note}>• {note}</li>
            ))}
          </ul>
        </div>
        <div className="card space-y-2">
          <p className="text-xs uppercase tracking-wide text-slate-400">Concentration</p>
          <p className="text-2xl font-semibold text-slate-900">
            Top 1: {(metrics.topWeights.top1 * 100).toFixed(1)}%
          </p>
          <p className="text-sm text-slate-500">HHI: {(metrics.hhi * 100).toFixed(1)}%</p>
          <p className="text-sm text-slate-500">
            Effective holdings: {metrics.effectiveHoldings.toFixed(1)}
          </p>
        </div>
        <div className="card space-y-2">
          <p className="text-xs uppercase tracking-wide text-slate-400">Data Quality</p>
          <p className="text-2xl font-semibold text-slate-900">Good</p>
          <p className="text-sm text-slate-500">
            Assumptions used for missing prices. Educational only.
          </p>
        </div>
      </section>

      <section className="card space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">Holdings</h2>
        <div className="grid gap-2 text-sm text-slate-600">
          {demoHoldings.map((holding) => (
            <div key={holding.ticker} className="flex items-center justify-between">
              <span>{holding.ticker}</span>
              <span>{holding.quantity}</span>
              <span>${holding.lastPrice?.toFixed(2)}</span>
              <span>{holding.assetClass}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Stress tests</h2>
          {stress.map((result) => (
            <div key={result.scenario} className="rounded-lg border border-slate-200 p-3 text-sm">
              <p className="font-semibold text-slate-700">{result.scenario}</p>
              <p className="text-xs text-slate-500">
                Impact: ${(result.impactDollars).toFixed(0)} ({(result.impactPct * 100).toFixed(1)}%)
              </p>
            </div>
          ))}
        </div>
        <div className="card space-y-4">
          <h2 className="text-xl font-semibold text-slate-900">Hypothetical Trade Plan</h2>
          <p className="text-xs text-slate-500">
            This is a hypothetical rebalance plan for educational purposes.
          </p>
          <div className="space-y-3 text-sm text-slate-600">
            {recommendations.map((rec) => (
              <div key={rec.ticker} className="rounded-lg border border-slate-200 p-3">
                <p className="font-semibold text-slate-700">{rec.ticker}</p>
                <p>{rec.action === "consider_buy" ? "Consider adding" : "Consider trimming"} ${rec.dollars.toFixed(0)}</p>
                <p className="text-xs text-slate-500">{rec.rationale}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
