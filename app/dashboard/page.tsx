"use client";

import { usePortfolio } from "@/contexts/PortfolioContext";
import { computeHoldingMetrics } from "@/lib/analytics";
import { scorePortfolio } from "@/lib/scoring";
import { defaultScenarios, runStressTest } from "@/lib/stress";
import { generateRebalancePlan, RebalancePreset } from "@/lib/rebalance";
import { Holding } from "@/lib/types";
import Link from "next/link";
import { useState } from "react";

const rebalancePresets: RebalancePreset[] = [
  "Balanced Growth",
  "Growth + Income",
  "Conservative Income",
  "Aggressive Growth"
];

function EmptyState() {
  return (
    <div className="card text-center py-16 animate-fade-in">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
        <svg className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-slate-900 mb-2">No Portfolio Yet</h2>
      <p className="text-slate-600 mb-6 max-w-md mx-auto">
        Import your holdings to get personalized portfolio analytics, stress tests, and rebalancing suggestions.
      </p>
      <Link href="/import" className="btn-primary">
        Import Your Portfolio
      </Link>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card">
            <div className="skeleton h-4 w-24 mb-3"></div>
            <div className="skeleton h-10 w-20 mb-2"></div>
            <div className="skeleton h-3 w-32"></div>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="skeleton h-6 w-32 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-10 w-full"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PortfolioSelector({
  portfolios,
  activeId,
  onSelect
}: {
  portfolios: { id: string; name: string }[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  if (portfolios.length <= 1) return null;

  return (
    <div className="flex items-center gap-3 mb-6">
      <label className="text-sm font-medium text-slate-600">Viewing:</label>
      <select
        value={activeId}
        onChange={(e) => onSelect(e.target.value)}
        className="select max-w-xs"
      >
        {portfolios.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
}

function ScoreCard({ score, total }: { score: { total: number; notes: string[] }; total: number }) {
  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-green-600";
    if (s >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="card">
      <p className="metric-label mb-2">Portfolio Score</p>
      <p className={`metric-value ${getScoreColor(score.total)}`}>{Math.round(score.total)}</p>
      <div className="mt-4 space-y-1">
        {score.notes.slice(0, 3).map((note, i) => (
          <p key={i} className="text-xs text-slate-500 flex items-start gap-2">
            <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-slate-300 shrink-0"></span>
            {note}
          </p>
        ))}
      </div>
    </div>
  );
}

function MetricsCard({ metrics }: { metrics: ReturnType<typeof computeHoldingMetrics> }) {
  return (
    <div className="card">
      <p className="metric-label mb-2">Concentration</p>
      <p className="metric-value">{(metrics.topWeights.top1 * 100).toFixed(0)}%</p>
      <p className="text-sm text-slate-500 mt-1">Top holding weight</p>
      <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
        <div>
          <p className="text-xs text-slate-500">HHI Index</p>
          <p className="font-semibold text-slate-900">{(metrics.hhi * 100).toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Effective Holdings</p>
          <p className="font-semibold text-slate-900">{metrics.effectiveHoldings.toFixed(1)}</p>
        </div>
      </div>
    </div>
  );
}

function TotalValueCard({ holdings }: { holdings: Holding[] }) {
  const totalValue = holdings.reduce((sum, h) => {
    const price = h.lastPrice ?? h.avgCost ?? 0;
    return sum + h.quantity * price;
  }, 0);

  const holdingCount = holdings.length;
  const assetClasses = new Set(holdings.map((h) => h.assetClass)).size;

  return (
    <div className="card">
      <p className="metric-label mb-2">Total Cost Basis</p>
      <p className="metric-value">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
      <p className="text-xs text-slate-400 mt-1">Based on your average cost</p>
      <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
        <div>
          <p className="text-xs text-slate-500">Holdings</p>
          <p className="font-semibold text-slate-900">{holdingCount}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Asset Classes</p>
          <p className="font-semibold text-slate-900">{assetClasses}</p>
        </div>
      </div>
    </div>
  );
}

function HoldingsTable({ holdings }: { holdings: Holding[] }) {
  const sortedHoldings = [...holdings].sort((a, b) => {
    const aVal = a.quantity * (a.lastPrice ?? a.avgCost ?? 0);
    const bVal = b.quantity * (b.lastPrice ?? b.avgCost ?? 0);
    return bVal - aVal;
  });

  return (
    <div className="card">
      <h2 className="section-title mb-4">Holdings</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="pb-3 text-left font-medium text-slate-500">Ticker</th>
              <th className="pb-3 text-right font-medium text-slate-500">Quantity</th>
              <th className="pb-3 text-right font-medium text-slate-500">Price</th>
              <th className="pb-3 text-right font-medium text-slate-500">Value</th>
              <th className="pb-3 text-left font-medium text-slate-500">Class</th>
            </tr>
          </thead>
          <tbody>
            {sortedHoldings.map((h, i) => {
              const price = h.lastPrice ?? h.avgCost ?? 0;
              const value = h.quantity * price;
              return (
                <tr key={i} className="border-b border-slate-100 last:border-0">
                  <td className="py-3 font-medium text-slate-900">{h.ticker}</td>
                  <td className="py-3 text-right text-slate-600">{h.quantity.toLocaleString()}</td>
                  <td className="py-3 text-right text-slate-600">${price.toFixed(2)}</td>
                  <td className="py-3 text-right font-medium text-slate-900">${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                  <td className="py-3">
                    <span className="tag">{h.assetClass}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StressTestsCard({ holdings }: { holdings: Holding[] }) {
  const stress = defaultScenarios.map((scenario) => runStressTest(holdings, scenario));

  return (
    <div className="card">
      <h2 className="section-title mb-4">Stress Tests</h2>
      <p className="text-sm text-slate-500 mb-4">Hypothetical impact under market scenarios</p>
      <div className="space-y-3">
        {stress.map((result) => (
          <div key={result.scenario} className="rounded-xl bg-slate-50 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-slate-900">{result.scenario}</p>
                <p className="text-xs text-slate-500 mt-1">{defaultScenarios.find(s => s.name === result.scenario)?.description}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-red-600">{(result.impactPct * 100).toFixed(1)}%</p>
                <p className="text-xs text-slate-500">${Math.abs(result.impactDollars).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RebalanceCard({ holdings }: { holdings: Holding[] }) {
  const [preset, setPreset] = useState<RebalancePreset>("Balanced Growth");
  const recommendations = generateRebalancePlan(holdings, preset);

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="section-title">Rebalancing Ideas</h2>
          <p className="text-sm text-slate-500 mt-1">Educational suggestions only</p>
        </div>
        <select
          value={preset}
          onChange={(e) => setPreset(e.target.value as RebalancePreset)}
          className="select text-sm w-auto"
        >
          {rebalancePresets.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>
      <div className="space-y-3">
        {recommendations.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">
            Your portfolio appears balanced for this strategy.
          </p>
        ) : (
          recommendations.map((rec, i) => (
            <div key={i} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-slate-900">{rec.ticker}</p>
                  <p className="text-xs text-slate-500 mt-1">{rec.rationale}</p>
                </div>
                <div className={`text-right ${rec.action === "consider_buy" ? "text-green-600" : "text-orange-600"}`}>
                  <p className="font-semibold">{rec.action === "consider_buy" ? "+" : "-"}${rec.dollars.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  <p className="text-xs">{rec.action === "consider_buy" ? "Consider adding" : "Consider trimming"}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { portfolios, activePortfolio, isLoading, setActivePortfolio } = usePortfolio();

  if (isLoading) {
    return (
      <div className="container-page">
        <LoadingState />
      </div>
    );
  }

  if (!activePortfolio || activePortfolio.holdings.length === 0) {
    return (
      <div className="container-page">
        <EmptyState />
      </div>
    );
  }

  const holdings: Holding[] = activePortfolio.holdings.map((h: any) => ({
    ...h,
    lastPrice: h.avgCost
  }));

  const metrics = computeHoldingMetrics(holdings);
  const score = scorePortfolio(holdings);

  const handleSelectPortfolio = (id: string) => {
    const portfolio = portfolios.find((p) => p.id === id);
    if (portfolio) setActivePortfolio(portfolio);
  };

  return (
    <div className="container-page animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{activePortfolio.name}</h1>
          <p className="text-sm text-slate-500">Last updated: {new Date(activePortfolio.createdAt).toLocaleDateString()}</p>
        </div>
        <Link href="/import" className="btn-secondary">
          + Add Holdings
        </Link>
      </div>

      <PortfolioSelector
        portfolios={portfolios}
        activeId={activePortfolio.id}
        onSelect={handleSelectPortfolio}
      />

      <div className="space-y-6">
        <section className="grid gap-6 lg:grid-cols-3">
          <ScoreCard score={score} total={score.total} />
          <MetricsCard metrics={metrics} />
          <TotalValueCard holdings={holdings} />
        </section>

        <HoldingsTable holdings={holdings} />

        <section className="grid gap-6 lg:grid-cols-2">
          <StressTestsCard holdings={holdings} />
          <RebalanceCard holdings={holdings} />
        </section>
      </div>
    </div>
  );
}
